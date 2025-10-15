// src/pages/candidate/CompleteProfilePage.tsx

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';
import toast from 'react-hot-toast';

// MUI Components
import { Container, Paper, Stepper, Step, StepLabel, Button, Box, Typography, CircularProgress } from '@mui/material';

// Import step components
import { PersonalInfoStep } from '../../components/candidate/PersonalInfoStep';
import { EducationStep } from '../../components/candidate/EducationStep';
import { ExperienceStep } from '../../components/candidate/ExperienceStep';
import { SkillsStep } from '../../components/candidate/SkillsStep';

// Import the shared type definition
import { type ProfileFormInputs } from './EditProfilePage';

const steps = ['Personal Information', 'Education', 'Work Experience', 'Skills'];

const stepFields: (keyof ProfileFormInputs | `address.${keyof ProfileFormInputs['address']}`)[][] = [
  ['phone', 'address.street', 'address.city', 'address.state', 'address.pinCode'],
  ['education'],
  ['experience'],
  ['skills'],
];

const updateProfile = async (data: ProfileFormInputs) => {
    const token = localStorage.getItem('token');
    const { data: responseData } = await api.put('/candidate/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
};

export const CompleteProfilePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { userInfo, token } = useAppSelector((state) => state.auth);

  const methods = useForm<ProfileFormInputs>({
    // --- THIS IS THE CRITICAL FIX ---
    // Ensure all fields, especially nested objects and arrays, have correct default values.
    defaultValues: {
        phone: '',
        address: { street: '', city: '', state: '', pinCode: '' },
        preferredLocations: [],
        education: [],
        experience: [],
        skills: [],
    },
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
        if (userInfo && token) {
            const updatedUserInfo = { ...userInfo, profileCompleted: true };
            dispatch(setCredentials({ userInfo: updatedUserInfo, token }));
        }
        queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
        toast.success('Profile created successfully!');
        navigate('/dashboard');
    },
    onError: (error: any) => {
        console.error("Profile creation error:", error.response?.data);
        toast.error(error.response?.data?.message || 'An error occurred while creating your profile.');
    }
  });

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await methods.trigger(fieldsToValidate as any);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

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

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography component="h1" variant="h4" align="center">
                Complete Your Profile
            </Typography>
            <Button component={RouterLink} to="/dashboard">
                Skip for now
            </Button>
        </Box>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <FormProvider {...methods}>
          {activeStep === steps.length - 1 ? (
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <CircularProgress size={24} /> : 'Submit Profile'}
                </Button>
              </Box>
            </form>
          ) : (
            <>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  type="button"
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </FormProvider>
      </Paper>
    </Container>
  );
};

export { type ProfileFormInputs };
