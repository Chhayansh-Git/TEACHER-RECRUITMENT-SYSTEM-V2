// src/pages/candidate/EditProfilePage.tsx

import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { setCredentials } from '../../app/authSlice';
import toast from 'react-hot-toast';

// MUI Components
import { Container, Paper, Stepper, Step, StepLabel, Button, Box, Typography, CircularProgress, Avatar, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// Import step components
import { PersonalInfoStep } from '../../components/candidate/PersonalInfoStep';
import { EducationStep } from '../../components/candidate/EducationStep';
import { ExperienceStep } from '../../components/candidate/ExperienceStep';
import { SkillsStep } from '../../components/candidate/SkillsStep';

// --- THIS IS THE NEW SINGLE SOURCE OF TRUTH FOR THE FORM SHAPE ---
export type AddressFields = {
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

export type ProfileFormInputs = {
  phone: string;
  address: AddressFields;
  preferredLocations: string[];
  education: {
    degree: string;
    institution: string;
    startYear: number;
    endYear: number;
  }[];
  experience: {
    jobTitle: string;
    company: string;
    companyAddress: AddressFields;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  skills: string[];
};

const steps = ['Personal Information', 'Education', 'Work Experience', 'Skills'];

const stepFields: (keyof ProfileFormInputs | `address.${keyof AddressFields}` | `experience.${number}.${keyof ProfileFormInputs['experience'][0]}`)[][] = [
  ['phone', 'address.street', 'address.city', 'address.state', 'address.pinCode'],
  ['education'],
  ['experience'],
  ['skills'],
];

const API_BASE_URL = 'http://localhost:5001';

const fetchCandidateProfile = async (): Promise<ProfileFormInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/candidate/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const updateProfile = async (data: ProfileFormInputs) => {
    const token = localStorage.getItem('token');
    const { data: responseData } = await api.put('/candidate/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
};

const uploadPicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem('token');
  const { data } = await api.put('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const EditProfilePage = () => {
  const { userInfo, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(userInfo?.profilePictureUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData, isLoading: isLoadingProfile } = useQuery<ProfileFormInputs>({
    queryKey: ['candidateProfile'],
    queryFn: fetchCandidateProfile,
  });

  const methods = useForm<ProfileFormInputs>({
    mode: 'onChange',
    // Initialize with correct structure to prevent errors before data loads
    defaultValues: {
        phone: '',
        address: { street: '', city: '', state: '', pinCode: '' },
        preferredLocations: [],
        education: [],
        experience: [],
        skills: [],
    },
  });

  useEffect(() => {
    if (profileData) {
      methods.reset(profileData);
    }
  }, [profileData, methods]);

  const pictureMutation = useMutation({ 
      mutationFn: uploadPicture,
      onError: () => {
          toast.error("Picture upload failed. Please ensure it's a valid image under 2MB.");
      }
  });

  const profileMutation = useMutation({ 
      mutationFn: updateProfile,
      onError: (error: any) => {
          console.error("Profile update error:", error.response?.data);
          toast.error(error.response?.data?.message || "An error occurred while updating your profile.");
      }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (formData: ProfileFormInputs) => {
    let newPictureUrl = userInfo?.profilePictureUrl;

    if (fileInputRef.current?.files?.[0]) {
        const uploadResult = await pictureMutation.mutateAsync(fileInputRef.current.files[0]);
        if(!uploadResult) return;
        newPictureUrl = uploadResult.profilePictureUrl;
    }

    await profileMutation.mutateAsync(formData);

    if (userInfo && token) {
        const updatedUserInfo = { ...userInfo, profilePictureUrl: newPictureUrl };
        dispatch(setCredentials({ userInfo: updatedUserInfo, token }));
    }
    queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
    toast.success('Profile saved successfully!');
    navigate('/candidate/profile'); // Navigate to the VIEW page on success
  };

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await methods.trigger(fieldsToValidate as any);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

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
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>
          Edit Your Profile
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-picture-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <label htmlFor="profile-picture-upload">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <Avatar src={preview ? (preview.startsWith('blob:') ? preview : `${API_BASE_URL}${preview}`) : undefined} sx={{ width: 100, height: 100, cursor: 'pointer' }}>
                 {!preview && <PhotoCamera sx={{ width: 40, height: 40 }} />}
              </Avatar>
            </IconButton>
          </label>
          <Button onClick={() => fileInputRef.current?.click()} sx={{mt: 1}}>Change Picture</Button>
        </Box>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <FormProvider {...methods}>
          {activeStep === steps.length - 1 ? (
            <form onSubmit={methods.handleSubmit(handleSave)}>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={profileMutation.isPending || pictureMutation.isPending}
                >
                  {(profileMutation.isPending || pictureMutation.isPending) ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </form>
          ) : (
            <>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
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