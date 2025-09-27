// src/pages/dashboard/DashboardPage.tsx

import { Typography, Box, Card, CardContent, CardActions, Button } from '@mui/material';
import { useAppSelector } from '../../hooks/redux.hooks';
import { Link as RouterLink } from 'react-router-dom';

export const DashboardPage = () => {
  const { userInfo } = useAppSelector((state) => state.auth);

  const needsProfileCompletion = userInfo?.role === 'candidate' && !userInfo.profileCompleted;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {userInfo ? userInfo.name : 'User'}!
      </Typography>

      {needsProfileCompletion ? (
        <Card sx={{ mt: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6">Your profile is incomplete!</Typography>
            <Typography sx={{ mt: 1 }}>
              Complete your professional profile to get noticed by schools and apply for job openings.
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              variant="contained" 
              color="secondary"
              component={RouterLink}
              to="/candidate/complete-profile"
            >
              Complete Profile Now
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Typography>
          You have successfully logged in to your dashboard.
        </Typography>
      )}
    </Box>
  );
};