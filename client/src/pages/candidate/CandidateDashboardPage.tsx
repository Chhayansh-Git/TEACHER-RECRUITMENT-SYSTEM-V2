// src/pages/candidate/CandidateDashboardPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Grid, Paper } from '@mui/material';

interface IStats {
  applicationsCount: number;
  interviewsCount: number;
  profileCompleted: boolean;
}

const fetchDashboardStats = async (): Promise<IStats> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/candidate/stats', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const StatCard = ({ title, value }: { title: string, value: number | string }) => (
  <Paper sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="h3" fontWeight="bold">{value}</Typography>
  </Paper>
);

export const CandidateDashboardPage = () => {
  const { data: stats, isLoading, isError } = useQuery<IStats>({
    queryKey: ['candidateDashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load dashboard statistics.</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Candidate Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}><StatCard title="Profile Status" value={stats?.profileCompleted ? 'Completed' : 'Incomplete'} /></Grid>
        <Grid item xs={12} sm={6}><StatCard title="Total Applications" value={stats?.applicationsCount || 0} /></Grid>
        <Grid item xs={12} sm={6}><StatCard title="Interview Invitations" value={stats?.interviewsCount || 0} /></Grid>
      </Grid>
    </Box>
  );
};