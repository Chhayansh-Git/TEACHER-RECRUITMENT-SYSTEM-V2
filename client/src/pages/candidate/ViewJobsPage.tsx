// src/pages/candidate/ViewJobsPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Chip, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface IJob {
  _id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  employmentType: string;
  location: string;
  salary?: number;
}

const fetchPublicJobs = async (): Promise<IJob[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/requirements/public', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const ViewJobsPage = () => {
  const { data: jobs, isLoading, isError } = useQuery<IJob[]>({
    queryKey: ['publicJobs'],
    queryFn: fetchPublicJobs,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not fetch job opportunities.</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Available Job Opportunities</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review these roles to better tailor your profile for AI matching. Direct applications are not available.
      </Typography>

      <Grid container spacing={3}>
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{job.subject} Teacher - {job.gradeLevel}</Typography>

                  <Box display="flex" alignItems="center" my={1}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{job.location}</Typography>
                  </Box>
                   <Box display="flex" alignItems="center" my={1}>
                    <BusinessCenterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{job.employmentType}</Typography>
                  </Box>
                  {job.salary && (
                     <Box display="flex" alignItems="center" my={1}>
                       <MonetizationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                       <Typography variant="body2">${job.salary.toLocaleString()} / year</Typography>
                     </Box>
                  )}

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ 
                      maxHeight: 100, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical'
                  }}>
                    {job.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>No open job opportunities at the moment.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
