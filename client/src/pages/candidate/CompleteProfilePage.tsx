// src/pages/candidate/CompleteProfilePage.tsx

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';

// MUI Components
import { Container, Paper, Stepper, Step, StepLabel, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

// Import step components
import { PersonalInfoStep } from '../../components/candidate/PersonalInfoStep';
import { EducationStep } from '../../components/candidate/EducationStep';
import { ExperienceStep } from '../../components/candidate/ExperienceStep';
import { SkillsStep } from '../../components/candidate/SkillsStep';

const steps = ['Personal Information', 'Education', 'Work Experience', 'Skills'];

// Define types for form entries
type EducationEntry = {
  degree: string;
  institution: string;
  startYear: number;
  endYear: number;
};

type ExperienceEntry = {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type ProfileFormInputs = {
  phone: string;
  address: string;
  preferredLocations: string[]; // Add this line
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
};

const updateProfile = async (data: ProfileFormInputs) => {
    const token = localStorage.getItem('token');
    const { data: responseData } = await api.put('/candidate/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
};

// Update stepFields for validation
const stepFields: (keyof ProfileFormInputs)[][] = [
  ['phone', 'address', 'preferredLocations'], // Add field to step 0
  ['education'],
  ['experience'],
  ['skills'],
];

export const CompleteProfilePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { userInfo, token } = useAppSelector((state) => state.auth);

  const methods = useForm<ProfileFormInputs>({
    defaultValues: {
      phone: '',
      address: '',
      preferredLocations: [], // Initialize as an empty array
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
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        navigate('/dashboard');
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await methods.trigger(fieldsToValidate);
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
      case 0:
        return <PersonalInfoStep />;
      case 1:
        return <EducationStep />;
      case 2:
        return <ExperienceStep />;
      case 3:
        return <SkillsStep />;
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Complete Your Profile
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <FormProvider {...methods}>
          {/* --- THIS IS THE KEY CHANGE --- */}
          {/* We render a form ONLY on the last step. Otherwise, it's a simple div. */}
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

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            An error occurred while updating your profile.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};