// client/src/pages/group-admin/GroupAdminDashboard.tsx
// ... imports from GroupAdminDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// The interface now includes the ROI part from the analytics endpoint
interface IGroupData {
    stats: {
        totalSchools: number;
        totalOpenRequirements: number;
        totalHires: number;
        organizationName: string;
    };
    roi: {
        estimatedHoursSaved: number;
    }
}

// We will fetch both stats and ROI from the single analytics endpoint for efficiency
const fetchGroupDashboardData = async (): Promise<IGroupData> => {  
  const token = localStorage.getItem('token');
  // We can reuse the analytics endpoint since it has all the data we need
  const { data: analytics } = await api.get('/group-admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
  const { data: stats } = await api.get('/group-admin/stats', { headers: { Authorization: `Bearer ${token}` } });

  return { stats, roi: analytics.roi };
};

const StatCard = ({ title, value, tooltip }: { title: string; value: number | string; tooltip?: string }) => (
  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        {tooltip && (
            <Tooltip title={tooltip}>
                <InfoOutlinedIcon fontSize="small" color="action" />
            </Tooltip>
        )}
    </Box>
    <Typography variant="h3" fontWeight="bold" color="primary">{value}</Typography>
  </Paper>
);

export const GroupAdminDashboardPage = () => {
  const { data, isLoading, isError } = useQuery<IGroupData>({
    queryKey: ['groupAdminDashboardData'],
    queryFn: fetchGroupDashboardData,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load dashboard statistics.</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {data?.stats?.organizationName} Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        An overview of all institutions under your management.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Schools" value={data?.stats?.totalSchools || 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Open Jobs (All Schools)" value={data?.stats?.totalOpenRequirements || 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Hires (All Time)" value={data?.stats?.totalHires || 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Est. Hours Saved" 
            value={`~${data?.roi?.estimatedHoursSaved || 0}`} 
            tooltip="Estimated time saved by using AI matching vs. manual screening (based on 5 mins/candidate)."
          />
        </Grid>
      </Grid>
    </Box>
  );
};