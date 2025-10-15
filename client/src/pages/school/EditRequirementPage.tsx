// src/pages/school/EditRequirementPage.tsx

import { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { Paper, Typography, TextField, Button, Grid, CircularProgress, Alert, Select, MenuItem, InputLabel, FormControl, Autocomplete, Chip, Box } from '@mui/material';

type RequirementFormInputs = {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  salary?: number;
  experienceRequired: string;
  qualifications: string[];
  benefits: string[];
  status: 'open' | 'closed' | 'filled';
};

const experienceOptions = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];
const qualificationOptions = ['B.Ed', 'M.Ed', 'PhD', 'TET Qualified', 'CTET Qualified'];
const benefitOptions = ['Health Insurance', 'Provident Fund (PF)', 'Paid Time Off', 'Maternity Leave'];
const statusOptions = ['open', 'closed', 'filled'];

const fetchRequirement = async (id: string): Promise<RequirementFormInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get(`/requirements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateRequirement = async ({ id, formData }: { id: string, formData: RequirementFormInputs }) => {
    const token = localStorage.getItem('token');
    const { data } = await api.put(`/requirements/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
    return data;
};

export const EditRequirementPage = () => {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<RequirementFormInputs>();

  const { data: requirementData, isLoading } = useQuery({
    queryKey: ['requirement', requirementId],
    queryFn: () => fetchRequirement(requirementId!),
    enabled: !!requirementId,
  });

  useEffect(() => {
    if (requirementData) {
      reset(requirementData);
    }
  }, [requirementData, reset]);

  const mutation = useMutation({
    mutationFn: updateRequirement,
    onSuccess: () => {
      toast.success('Requirement updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['schoolRequirements'] });
      queryClient.invalidateQueries({ queryKey: ['requirement', requirementId] });
      navigate('/school/requirements');
    },
    onError: () => {
        toast.error('Failed to update requirement.');
    }
  });

  const onSubmit: SubmitHandler<RequirementFormInputs> = data => {
    if (requirementId) {
        mutation.mutate({ id: requirementId, formData: data });
    }
  };
  
  if (isLoading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Edit Job Requirement</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* All the form fields remain the same */}
          <Grid item xs={12}><Controller name="title" control={control} rules={{ required: 'Job title is required' }} render={({ field }) => <TextField {...field} label="Job Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />} /></Grid>
          <Grid item xs={12}><Controller name="description" control={control} rules={{ required: 'Description is required' }} render={({ field }) => <TextField {...field} label="Job Description" multiline rows={4} fullWidth error={!!errors.description} helperText={errors.description?.message} />} /></Grid>
          <Grid item xs={12} sm={6}><Controller name="subject" control={control} rules={{ required: 'Subject is required' }} render={({ field }) => <TextField {...field} label="Subject" fullWidth error={!!errors.subject} helperText={errors.subject?.message} />} /></Grid>
          <Grid item xs={12} sm={6}><Controller name="gradeLevel" control={control} rules={{ required: 'Grade level is required' }} render={({ field }) => <TextField {...field} label="Grade Level" fullWidth error={!!errors.gradeLevel} helperText={errors.gradeLevel?.message} />} /></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth error={!!errors.employmentType}><InputLabel>Employment Type</InputLabel><Controller name="employmentType" control={control} render={({ field }) => <Select {...field} label="Employment Type"><MenuItem value="Full-time">Full-time</MenuItem><MenuItem value="Part-time">Part-time</MenuItem><MenuItem value="Contract">Contract</MenuItem></Select>} /></FormControl></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth error={!!errors.experienceRequired}><InputLabel>Experience Required</InputLabel><Controller name="experienceRequired" control={control} rules={{ required: true }} render={({ field }) => <Select {...field} label="Experience Required">{experienceOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select>} /></FormControl></Grid>
          <Grid item xs={12} sm={6}><Controller name="location" control={control} rules={{ required: 'Location is required' }} render={({ field }) => <TextField {...field} label="Location" fullWidth error={!!errors.location} helperText={errors.location?.message} />} /></Grid>
          <Grid item xs={12} sm={6}><Controller name="salary" control={control} render={({ field }) => <TextField {...field} label="Salary (Annual, optional)" type="number" fullWidth />} /></Grid>
          <Grid item xs={12}><Controller name="qualifications" control={control} rules={{ required: 'At least one qualification is required' }} render={({ field: { onChange, value } }) => <Autocomplete multiple options={qualificationOptions} value={value || []} onChange={(e, newValue) => onChange(newValue)} freeSolo renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} label="Required Qualifications" />)} />} /></Grid>
          <Grid item xs={12}><Controller name="benefits" control={control} render={({ field: { onChange, value } }) => <Autocomplete multiple options={benefitOptions} value={value || []} onChange={(e, newValue) => onChange(newValue)} freeSolo renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} label="Benefits (Optional)" />)} />} /></Grid>
          <Grid item xs={12}><FormControl fullWidth error={!!errors.status}><InputLabel>Status</InputLabel><Controller name="status" control={control} rules={{ required: true }} render={({ field }) => <Select {...field} label="Status">{statusOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select>} /></FormControl></Grid>
          
          {/* --- THIS IS THE FIX --- */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={mutation.isPending}>
                {mutation.isPending ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/school/requirements')}>
                    Cancel
                </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};