// src/pages/admin/SettingsPage.tsx

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { Paper, Typography, TextField, Button, Grid, CircularProgress, Box, Tabs, Tab } from '@mui/material';

interface ISettings {
    siteName: string;
    defaultTheme: 'light' | 'dark';
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    twilioAccountSid?: string;
    twilioAuthToken?: string;
}

const fetchSettings = async (): Promise<ISettings> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/settings', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateSettings = async (settingsData: ISettings) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put('/settings', settingsData, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const SettingsPage = () => {
  const [tab, setTab] = useState(0);
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<ISettings>();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (settingsData) reset(settingsData);
  }, [settingsData, reset]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error('Failed to update settings.'),
  });

  const onSubmit = (data: ISettings) => mutation.mutate(data);

  if (isLoading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>System Settings</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="General" />
          <Tab label="API Keys" />
        </Tabs>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller name="siteName" control={control} render={({ field }) => <TextField {...field} label="Platform Name" fullWidth />} />
            </Grid>
            {/* Dark mode toggle would require a theme context - skipping for now */}
          </Grid>
        )}
        {tab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}><Typography variant="h6">Razorpay</Typography></Grid>
            <Grid item xs={12} sm={6}><Controller name="razorpayKeyId" control={control} render={({ field }) => <TextField {...field} label="Key ID" fullWidth />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="razorpayKeySecret" control={control} render={({ field }) => <TextField {...field} label="Key Secret" type="password" fullWidth />} /></Grid>
            <Grid item xs={12}><Typography variant="h6">Twilio</Typography></Grid>
            <Grid item xs={12} sm={6}><Controller name="twilioAccountSid" control={control} render={({ field }) => <TextField {...field} label="Account SID" fullWidth />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="twilioAuthToken" control={control} render={({ field }) => <TextField {...field} label="Auth Token" type="password" fullWidth />} /></Grid>
          </Grid>
        )}
        <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={mutation.isPending}>
          {mutation.isPending ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </form>
    </Paper>
  );
};