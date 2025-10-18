import { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';
import toast from 'react-hot-toast';
import {
    Container, Paper, Typography, TextField, Button, Grid,
    CircularProgress, Alert, Box
} from '@mui/material';

type EnterpriseInterestInputs = {
    name: string;
    email: string;
    phone: string;
    organizationName: string;
    numberOfSchools: number;
    message?: string;
};

const submitEnterpriseLead = async (formData: EnterpriseInterestInputs) => {
    const token = localStorage.getItem('token');
    const { data } = await api.post('/leads/enterprise-interest', formData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const EnterpriseInterestPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useAppSelector(state => state.auth);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<EnterpriseInterestInputs>();

    // Pre-populate the form with the logged-in user's details
    useEffect(() => {
        if (userInfo) {
            reset({
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone || '',
                organizationName: '',
                numberOfSchools: 1,
            });
        }
    }, [userInfo, reset]);

    const mutation = useMutation({
        mutationFn: submitEnterpriseLead,
        onSuccess: (data) => {
            toast.success(data.message);
            // Redirect user to the dashboard after a successful submission
            navigate('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit your request. Please try again.');
        }
    });

    const onSubmit: SubmitHandler<EnterpriseInterestInputs> = data => {
        mutation.mutate(data);
    };

    return (
        <Container component="main" maxWidth="md">
            <Paper sx={{ mt: 4, p: 4 }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold">
                    Enterprise Plan Inquiry
                </Typography>
                <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
                    Tell us a bit about your organization, and a dedicated account manager will get in touch to tailor a plan that fits your needs.
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}><Typography variant="h6">Your Contact Information</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="name" control={control} rules={{ required: 'Your name is required' }} render={({ field }) => <TextField {...field} label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="email" control={control} rules={{ required: 'Email is required' }} render={({ field }) => <TextField {...field} type="email" label="Work Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="phone" control={control} rules={{ required: 'Phone number is required' }} render={({ field }) => <TextField {...field} label="Phone Number" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />} />
                        </Grid>
                        
                        <Grid item xs={12} mt={2}><Typography variant="h6">Your Organization</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="organizationName" control={control} rules={{ required: 'Organization name is required' }} render={({ field }) => <TextField {...field} label="Group or Chain Name" fullWidth error={!!errors.organizationName} helperText={errors.organizationName?.message} />} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                             <Controller name="numberOfSchools" control={control} rules={{ required: 'Number of schools is required', min: 1 }} render={({ field }) => <TextField {...field} label="Number of Schools" type="number" fullWidth InputProps={{ inputProps: { min: 1 } }} error={!!errors.numberOfSchools} helperText={errors.numberOfSchools?.message} />} />
                        </Grid>
                        <Grid item xs={12}>
                             <Controller name="message" control={control} render={({ field }) => <TextField {...field} label="Additional questions or comments (optional)" multiline rows={4} fullWidth />} />
                        </Grid>

                        {mutation.isError && <Grid item xs={12}><Alert severity="error">{(mutation.error as any).response?.data?.message || 'An error occurred'}</Alert></Grid>}

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
                                    {mutation.isPending ? <CircularProgress size={24} /> : 'Submit Inquiry'}
                                </Button>
                                <Button variant="outlined" size="large" onClick={() => navigate('/school/subscription')}>
                                    Cancel
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};