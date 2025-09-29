// src/pages/candidate/ViewProfilePage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.hooks';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Button, List, ListItem, ListItemText, Divider, Chip, ListItemIcon } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

// Import the exported type from EditProfilePage
import { type ProfileFormInputs } from './EditProfilePage'; 

const API_BASE_URL = 'http://localhost:5001';

const fetchCandidateProfile = async (): Promise<ProfileFormInputs> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/candidate/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const ViewProfilePage = () => {
  const { userInfo } = useAppSelector(state => state.auth);
  const { data: profile, isLoading, isError } = useQuery<ProfileFormInputs>({
    queryKey: ['candidateProfile'],
    queryFn: fetchCandidateProfile,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not load your profile. Please complete it if you haven't.</Alert>;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar 
            src={userInfo?.profilePictureUrl ? `${API_BASE_URL}${userInfo.profilePictureUrl}` : undefined}
            sx={{ width: 150, height: 150, margin: '0 auto 16px' }}
          >
            {userInfo?.name.charAt(0)}
          </Avatar>
          <Typography variant="h5">{userInfo?.name}</Typography>
          <Typography color="text.secondary">{userInfo?.email}</Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            component={RouterLink}
            to="/candidate/profile/edit"
            sx={{ mt: 2 }}
          >
            Edit Profile
          </Button>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Contact Information</Typography>
          <List dense>
            <ListItem><ListItemIcon><PhoneIcon /></ListItemIcon><ListItemText primary={profile?.phone} /></ListItem>
            <ListItem><ListItemIcon><LocationOnIcon /></ListItemIcon><ListItemText primary={profile?.address} /></ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile?.skills?.map((skill: string) => <Chip key={skill} label={skill} />)}
          </Box>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Education</Typography>
          {profile?.education?.map((edu: any, index: number) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">{edu.degree}</Typography>
              <Typography>{edu.institution}</Typography>
              <Typography variant="body2" color="text.secondary">{edu.startYear} - {edu.endYear}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Work Experience</Typography>
           {profile?.experience?.map((exp: any, index: number) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">{exp.jobTitle}</Typography>
              <Typography>{exp.company}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};