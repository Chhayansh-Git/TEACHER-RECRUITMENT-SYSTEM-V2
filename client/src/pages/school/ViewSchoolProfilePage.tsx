// src/pages/school/ViewSchoolProfilePage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.hooks';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const API_BASE_URL = 'http://localhost:5001';

type SchoolProfile = {
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

const fetchSchoolProfile = async (): Promise<SchoolProfile> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/school/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const ViewSchoolProfilePage = () => {
  const { userInfo } = useAppSelector(state => state.auth);
  const { data: profile, isLoading, isError } = useQuery<SchoolProfile>({
    queryKey: ['schoolProfile'],
    queryFn: fetchSchoolProfile,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not load school profile.</Alert>;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">School Profile</Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={RouterLink}
          to="/school/profile/edit"
        >
          Edit Profile
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
           <Avatar 
            src={userInfo?.profilePictureUrl ? `${API_BASE_URL}${userInfo.profilePictureUrl}` : undefined}
            sx={{ width: 150, height: 150, margin: '0 auto 16px', borderRadius: '4px' }}
            variant="square"
          >
            <BusinessIcon sx={{ width: 80, height: 80 }} />
          </Avatar>
          <Typography variant="h5">{userInfo?.name}</Typography>
          <Typography color="text.secondary">{userInfo?.email}</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Key Personnel</Typography>
          <List dense>
            <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="Principal" secondary={profile?.principalName} />
            </ListItem>
             <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="Director" secondary={profile?.directorName} />
            </ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Location & Details</Typography>
           <List dense>
            <ListItem>
                <ListItemText primary="Address" secondary={`${profile?.address}, ${profile?.city}, ${profile?.state} - ${profile?.pinCode}`} />
            </ListItem>
             <ListItem>
                <ListItemText primary="CBSE Affiliation No." secondary={profile?.cbseAffiliationNumber || 'Not Provided'} />
            </ListItem>
             <ListItem>
                <ListItemText primary="Total Student Strength" secondary={profile?.studentStrength || 'Not Provided'} />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};