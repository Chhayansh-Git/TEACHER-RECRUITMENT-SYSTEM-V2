// src/pages/school/ViewSchoolProfilePage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.hooks';
import { isAxiosError } from 'axios';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const API_BASE_URL = 'http://localhost:5001';

// Correctly define the nested address type
type AddressFields = {
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

// Update the main profile type
type SchoolProfile = {
  address: AddressFields;
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

// Helper function to safely format the address object
const formatAddress = (address: AddressFields | undefined) => {
    if (!address) return 'Not Provided';
    const parts = [address.street, address.city, address.state, address.pinCode].filter(Boolean);
    return parts.join(', ');
};

export const ViewSchoolProfilePage = () => {
  const { userInfo } = useAppSelector(state => state.auth);
  const { data: profile, isLoading, isError, error } = useQuery<SchoolProfile>({
    queryKey: ['schoolProfile'],
    queryFn: fetchSchoolProfile,
    retry: false,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) {
      if (isAxiosError(error) && error.response?.status === 404) {
          // Profile is not yet created, redirect to the edit/create page.
          return <Navigate to="/school/profile/edit" replace />;
      }
      return <Alert severity="error">Could not load school profile.</Alert>;
  }


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
          <Typography variant="h5" fontWeight="bold">{userInfo?.name}</Typography>
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
                <ListItemIcon><LocationOnIcon /></ListItemIcon>
                {/* Use the helper function to display the formatted address */}
                <ListItemText primary="Address" secondary={formatAddress(profile?.address)} />
            </ListItem>
             <ListItem>
                <ListItemText primary="CBSE Affiliation No." secondary={profile?.cbseAffiliationNumber || 'Not Provided'} />
             </ListItem>
             <ListItem>
                <ListItemText primary="Total Student Strength" secondary={profile?.studentStrength?.toString() || 'Not Provided'} />
             </ListItem>
          </List>
           <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>About</Typography>
            <Typography variant="body2" color="text.secondary">
                {profile?.about || 'No description provided.'}
            </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};