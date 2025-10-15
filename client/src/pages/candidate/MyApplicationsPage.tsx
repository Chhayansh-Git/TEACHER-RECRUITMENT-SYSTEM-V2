// src/pages/candidate/MyApplicationsPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Stepper, Step, StepLabel, StepContent, Avatar } from '@mui/material';

const API_BASE_URL = 'http://localhost:5001';

interface IApplication {
  _id: string;
  school: {
    _id: string;
    name: string;
    profilePictureUrl?: string;
  };
  requirement: {
    _id: string;
    title: string;
    location: string;
  };
  status: 'pushed' | 'viewed' | 'shortlisted' | 'interview scheduled' | 'rejected';
  createdAt: string;
}

const fetchMyApplications = async (): Promise<IApplication[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/candidate/my-applications', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const steps = ['Pushed', 'Shortlisted', 'Interview Scheduled'];

const getActiveStep = (status: IApplication['status']) => {
    switch (status) {
        case 'pushed': return 0;
        case 'viewed': return 0; // Still in the "pushed" stage from candidate's perspective
        case 'shortlisted': return 1;
        case 'interview scheduled': return 2;
        default: return -1; // For rejected or other statuses
    }
};

export const MyApplicationsPage = () => {
  const { data: applications, isLoading, isError } = useQuery<IApplication[]>({
    queryKey: ['myApplications'],
    queryFn: fetchMyApplications,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not fetch your application statuses.</Alert>;

  return (
    <Paper sx={{ p: 4, backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Typography variant="h4" gutterBottom>My Applications</Typography>
      
      {applications && applications.length > 0 ? (
        applications.map(app => (
          <Paper key={app._id} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                    src={app.school.profilePictureUrl ? `${API_BASE_URL}${app.school.profilePictureUrl}` : undefined}
                    sx={{ width: 56, height: 56, mr: 2 }}
                >
                    {app.school.name.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h6">{app.requirement.title}</Typography>
                    <Typography color="text.secondary">{app.school.name} - {app.requirement.location}</Typography>
                </Box>
            </Box>

            <Stepper activeStep={getActiveStep(app.status)} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>
                    {label}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                        {index === 0 && `Your profile was submitted to this school on ${new Date(app.createdAt).toLocaleDateString()}.`}
                        {index === 1 && 'The school has shortlisted your profile for further consideration.'}
                        {index === 2 && 'An interview has been scheduled. Please check your "My Interviews" page for details.'}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
             {app.status === 'rejected' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Unfortunately, the school has decided not to move forward with your application at this time.
                </Alert>
            )}
          </Paper>
        ))
      ) : (
        <Typography>You do not have any active applications at this time.</Typography>
      )}
    </Paper>
  );
};