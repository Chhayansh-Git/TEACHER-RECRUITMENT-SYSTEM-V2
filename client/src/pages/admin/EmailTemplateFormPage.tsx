// src/pages/admin/EmailTemplateFormPage.tsx

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { Paper, Typography, TextField, Button, Grid, CircularProgress, Box, Autocomplete, Chip } from '@mui/material';

interface IEmailTemplate {
  key: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
}

const fetchTemplate = async (id: string): Promise<IEmailTemplate> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get(`/email-templates/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const saveTemplate = async ({ id, templateData }: { id?: string, templateData: IEmailTemplate }) => {
  const token = localStorage.getItem('token');
  if (id) {
    // Update existing
    const { data } = await api.put(`/email-templates/${id}`, templateData, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  } else {
    // Create new
    const { data } = await api.post('/email-templates', templateData, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  }
};

export const EmailTemplateFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const { control, handleSubmit, reset } = useForm<IEmailTemplate>();

  const { data: templateData, isLoading } = useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: () => fetchTemplate(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (templateData) reset(templateData);
  }, [templateData, reset]);

  const mutation = useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => {
      toast.success(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      navigate('/admin/email-templates');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An error occurred.');
    }
  });

  const onSubmit = (data: IEmailTemplate) => {
    mutation.mutate({ id, templateData: data });
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>{isEditMode ? 'Edit' : 'Create'} Email Template</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller name="key" control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Unique Key" fullWidth disabled={isEditMode} helperText="e.g., 'welcome-email'. Cannot be changed." />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Template Name" fullWidth helperText="A friendly name for the template list." />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="subject" control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Email Subject" fullWidth />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="body" control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Email Body (HTML allowed)" multiline rows={15} fullWidth />} />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="placeholders"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete multiple freeSolo options={[]} value={value || []} onChange={(e, newValue) => onChange(newValue)} renderTags={(value, getTagProps) => value.map((option, index) => (<Chip label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} label="Available Placeholders" helperText="Type a placeholder (e.g., 'candidateName') and press Enter. These will be replaced with real data." />)} />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? <CircularProgress size={24} /> : 'Save Template'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};