// src/pages/school/SchoolProfilePage.tsx

import { useEffect } from 'react';
import { useForm, Controller,  type SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

// MUI Components
import { Paper, Typography, TextField, Button, Grid, CircularProgress, Alert } from '@mui/material';

type SchoolProfileInputs = {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  principalName: string;
  directorName: string;
  cbseAffiliationNumber?: string;
  studentStrength?: number;
  about?: string;
};

const fetchSchoolProfile = async (): Promise<SchoolProfileInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/school/profile', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateSchoolProfile = async (profileData: SchoolProfileInputs) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put('/school/profile', profileData, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const SchoolProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SchoolProfileInputs>();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: fetchSchoolProfile,
  });

  useEffect(() => {
    if (profileData) {
      reset(profileData);
    }
  }, [profileData, reset]);

  const mutation = useMutation({
    mutationFn: updateSchoolProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolProfile'] });
      navigate('/dashboard');
    },
  });

  const onSubmit: SubmitHandler<SchoolProfileInputs> = data => mutation.mutate(data);

  if (isLoading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Manage School Profile</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller name="principalName" control={control} rules={{ required: 'Principal name is required' }} render={({ field }) => <TextField {...field} label="Principal Name" fullWidth error={!!errors.principalName} helperText={errors.principalName?.message} />} />
          </Grid>
           <Grid item xs={12}>
            <Controller name="directorName" control={control} rules={{ required: 'Director name is required' }} render={({ field }) => <TextField {...field} label="Director Name" fullWidth error={!!errors.directorName} helperText={errors.directorName?.message} />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="address" control={control} rules={{ required: 'Address is required' }} render={({ field }) => <TextField {...field} label="School Address" fullWidth error={!!errors.address} helperText={errors.address?.message} />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="city" control={control} rules={{ required: 'City is required' }} render={({ field }) => <TextField {...field} label="City" fullWidth error={!!errors.city} helperText={errors.city?.message} />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="state" control={control} rules={{ required: 'State is required' }} render={({ field }) => <TextField {...field} label="State" fullWidth error={!!errors.state} helperText={errors.state?.message} />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="pinCode" control={control} rules={{ required: 'PIN Code is required' }} render={({ field }) => <TextField {...field} label="PIN Code" fullWidth error={!!errors.pinCode} helperText={errors.pinCode?.message} />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="cbseAffiliationNumber" control={control} render={({ field }) => <TextField {...field} label="CBSE Affiliation No. (Optional)" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="studentStrength" control={control} render={({ field }) => <TextField {...field} label="Total Student Strength (Optional)" type="number" fullWidth />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="about" control={control} render={({ field }) => <TextField {...field} label="About the School (Optional)" multiline rows={4} fullWidth />} />
          </Grid>
          {mutation.isError && (
            <Grid item xs={12}><Alert severity="error">Failed to update profile. Please try again.</Alert></Grid>
          )}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};