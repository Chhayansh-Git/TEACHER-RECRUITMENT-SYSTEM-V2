// client/src/pages/group-admin/GroupAnalyticsPage.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip as MuiTooltip
} from '@mui/material';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IAnalyticsData {
  funnel: {
    recommended: number;
    shortlisted: number;
    interviewScheduled: number;
    offerSent: number;
    hired: number;
  };
  benchmarking: {
    schoolName: string;
    totalPushed: number;
    totalHires: number;
    conversionRate: number;
    avgTimeToFill: number | null;
  }[];
  roi: {
    estimatedHoursSaved: number;
  };
}

const fetchGroupAnalytics = async (): Promise<IAnalyticsData> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/group-admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const GroupAnalyticsPage = () => {
  const { data: analytics, isLoading, isError } = useQuery<IAnalyticsData>({
    queryKey: ['groupAdminAnalytics'],
    queryFn: fetchGroupAnalytics,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load analytics data. Ensure at least one school has been added to your group.</Alert>;

  const funnelData = [
    { name: 'Recommended', value: analytics?.funnel.recommended || 0, fill: '#6B728E' },
    { name: 'Shortlisted', value: analytics?.funnel.shortlisted || 0, fill: '#4E5BA6' },
    { name: 'Interviewed', value: analytics?.funnel.interviewScheduled || 0, fill: '#3C4F76' },
    { name: 'Offered', value: analytics?.funnel.offerSent || 0, fill: '#3A2E39' },
    { name: 'Hired', value: analytics?.funnel.hired || 0, fill: '#1E152A' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Group Analytics</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6">Aggregated Recruitment Funnel</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>School Performance Benchmarking</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>School Name</TableCell>
                    <TableCell align="right">Candidates Recommended</TableCell>
                    <TableCell align="right">Total Hires</TableCell>
                    <TableCell align="right">Conversion Rate</TableCell>
                    <TableCell align="right">
                      <MuiTooltip title="Average time in days from candidate recommendation to being hired.">
                        <span>Avg. Time to Fill</span>
                      </MuiTooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics?.benchmarking.sort((a,b) => b.totalHires - a.totalHires).map((school) => (
                    <TableRow key={school.schoolName}>
                      <TableCell component="th" scope="row">{school.schoolName}</TableCell>
                      <TableCell align="right">{school.totalPushed}</TableCell>
                      <TableCell align="right">{school.totalHires}</TableCell>
                      <TableCell align="right">{school.conversionRate}%</TableCell>
                      <TableCell align="right">{school.avgTimeToFill ? `${school.avgTimeToFill} days` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};