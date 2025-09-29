// src/pages/school/SchoolDashboardPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IStats {
  totalRequirements: number;
  openRequirements: number;
  totalPushed: number;
  interviewsScheduled: number;
}

const fetchDashboardStats = async (): Promise<IStats> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/school/stats', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const StatCard = ({ title, value }: { title: string, value: number }) => (
  <Paper sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="h3" fontWeight="bold">{value}</Typography>
  </Paper>
);

export const SchoolDashboardPage = () => {
  const { data: stats, isLoading, isError } = useQuery<IStats>({
    queryKey: ['schoolDashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load dashboard statistics.</Alert>;

  const filledRequirements = (stats?.totalRequirements || 0) - (stats?.openRequirements || 0);
  const chartData = [
    { name: 'Open Postings', value: stats?.openRequirements || 0 },
    { name: 'Closed/Filled', value: filledRequirements },
  ];
  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>School Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Job Postings" value={stats?.totalRequirements || 0} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Candidates Recommended" value={stats?.totalPushed || 0} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Interviews Scheduled" value={stats?.interviewsScheduled || 0} /></Grid>
      </Grid>

      <Paper sx={{ p: 3, height: 400 }}>
         <Typography variant="h6" gutterBottom>Job Postings Overview</Typography>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};