// src/pages/admin/AdminDashboardPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IStats {
  totalCandidates: number;
  totalSchools: number;
  openRequirements: number;
  filledRequirements: number;
}

const fetchDashboardStats = async (): Promise<IStats> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const StatCard = ({ title, value }: { title: string, value: number }) => (
  <Paper sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="h3" fontWeight="bold">{value}</Typography>
  </Paper>
);

export const AdminDashboardPage = () => {
  const { data: stats, isLoading, isError } = useQuery<IStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load dashboard statistics.</Alert>;

  const chartData = [
    { name: 'Candidates', count: stats?.totalCandidates || 0 },
    { name: 'Schools', count: stats?.totalSchools || 0 },
    { name: 'Open Jobs', count: stats?.openRequirements || 0 },
    { name: 'Filled Jobs', count: stats?.filledRequirements || 0 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Candidates" value={stats?.totalCandidates || 0} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Schools" value={stats?.totalSchools || 0} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Open Requirements" value={stats?.openRequirements || 0} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Positions Filled" value={stats?.filledRequirements || 0} /></Grid>
      </Grid>

      <Paper sx={{ p: 3, height: 400 }}>
         <Typography variant="h6" gutterBottom>Platform Overview</Typography>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};