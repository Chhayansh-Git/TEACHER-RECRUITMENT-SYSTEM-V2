// src/pages/candidate/ViewProfilePage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.hooks';
import { isAxiosError } from 'axios';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Button, List, ListItem, ListItemText, Divider, Chip, ListItemIcon } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

// Import the exported types from EditProfilePage
import type { ProfileFormInputs, AddressFields } from './EditProfilePage'; 

const API_BASE_URL = 'http://localhost:5001';

const fetchCandidateProfile = async (): Promise<ProfileFormInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/candidate/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Helper function to format the address object into a readable string
const formatAddress = (address: AddressFields | undefined) => {
    if (!address) return 'Not Provided';
    const parts = [address.street, address.city, address.state, address.pinCode].filter(Boolean); // Filter out any empty parts
    return parts.join(', ');
};

export const ViewProfilePage = () => {
  const { userInfo } = useAppSelector(state => state.auth);
  const { data: profile, isLoading, isError, error } = useQuery<ProfileFormInputs>({
    queryKey: ['candidateProfile'],
    queryFn: fetchCandidateProfile,
    retry: false, // Prevent retrying on a 404 error
  });

  if (isLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
        </Box>
    );
  }

  if (isError) {
    if (isAxiosError(error) && error.response?.status === 404) {
      // Profile doesn't exist, gracefully redirect to the completion page.
      return <Navigate to="/candidate/complete-profile" replace />;
    }
    return <Alert severity="error">Could not load your profile data. Please try again later.</Alert>;
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar 
            src={userInfo?.profilePictureUrl ? `${API_BASE_URL}${userInfo.profilePictureUrl}` : undefined}
            sx={{ width: 150, height: 150, margin: '0 auto 16px', fontSize: '4rem' }}
          >
            {userInfo?.name.charAt(0)}
          </Avatar>
          <Typography variant="h5" fontWeight="bold">{userInfo?.name}</Typography>
          <Typography color="text.secondary">{userInfo?.email}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">{profile?.phone}</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            component={RouterLink}
            to="/candidate/profile/edit"
            sx={{ mt: 2, width: '100%' }}
          >
            Edit Profile
          </Button>
        </Grid>
        <Grid xs={12} md={8}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Address</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon sx={{ minWidth: '40px' }}><LocationOnIcon /></ListItemIcon>
                <ListItemText primary={formatAddress(profile?.address)} />
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Preferred Locations:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile?.preferredLocations?.map((loc: string) => <Chip key={loc} label={loc} variant="outlined" />)}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile?.skills?.map((skill: string) => <Chip key={skill} label={skill} color="primary" variant="outlined" />)}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Education</Typography>
            {profile?.education?.map((edu, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}><SchoolIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{edu.degree}</Typography>
                  <Typography>{edu.institution}</Typography>
                  <Typography variant="body2" color="text.secondary">{edu.startYear} - {edu.endYear}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" gutterBottom>Work Experience</Typography>
             {profile?.experience?.map((exp, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}><WorkHistoryIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{exp.jobTitle}</Typography>
                  <Typography>{exp.company}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatAddress(exp.companyAddress)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};