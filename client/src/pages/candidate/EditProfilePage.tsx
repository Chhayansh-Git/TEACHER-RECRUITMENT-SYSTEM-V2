// src/pages/candidate/EditProfilePage.tsx

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';

// MUI Components
import { Container, Paper, Stepper, Step, StepLabel, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

// Import step components
import { PersonalInfoStep } from '../../components/candidate/PersonalInfoStep';
import { EducationStep } from '../../components/candidate/EducationStep';
import { ExperienceStep } from '../../components/candidate/ExperienceStep';
import { SkillsStep } from '../../components/candidate/SkillsStep';
import type { ProfileFormInputs } from './CompleteProfilePage'; // Reuse the type

const steps = ['Personal Information', 'Education', 'Work Experience', 'Skills'];

// API function to fetch current profile
const fetchCandidateProfile = async (): Promise<ProfileFormInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/candidate/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// API function to update profile (reused)
const updateProfile = async (data: ProfileFormInputs) => {
    const token = localStorage.getItem('token');
    const { data: responseData } = await api.put('/candidate/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
};

export const EditProfilePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the current profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery<ProfileFormInputs>({
    queryKey: ['candidateProfile'],
    queryFn: fetchCandidateProfile,
  });

  const methods = useForm<ProfileFormInputs>();

  // Use useEffect to populate the form once data is fetched
  useEffect(() => {
    if (profileData) {
      methods.reset(profileData);
    }
  }, [profileData, methods]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
        navigate('/dashboard'); // Navigate back to dashboard on success
    },
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = (data: ProfileFormInputs) => {
    mutation.mutate(data);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: return <PersonalInfoStep />;
      case 1: return <EducationStep />;
      case 2: return <ExperienceStep />;
      case 3: return <SkillsStep />;
      default: throw new Error('Unknown step');
    }
  };

  if (isLoadingProfile) {
    return <CircularProgress />;
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Edit Your Profile
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} type="button">Next</Button>
              )}
            </Box>
          </form>
        </FormProvider>

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>An error occurred while updating your profile.</Alert>
        )}
      </Paper>
    </Container>
  );
};