// src/pages/admin/ReportsPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { format } from 'date-fns';

// MUI Components
import { Paper, Typography, Box, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Define the shape of the report data from our API
interface IReportData {
  reportPeriod: { from: string; to: string };
  userGrowth: { newCandidates: number; newSchools: number };
  platformActivity: { requirementsPosted: number; candidatesPushed: number };
  monetization: { newSubscriptions: number };
}

const fetchReport = async (startDate: Date, endDate: Date): Promise<IReportData> => {
  const token = localStorage.getItem('token');
  const params = {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
  const { data } = await api.get('/reports', { headers: { Authorization: `Bearer ${token}` }, params });
  return data;
};

const StatCard = ({ title, value }: { title: string, value: number }) => (
  <Paper sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="h4" fontWeight="bold">{value}</Typography>
  </Paper>
);

export const ReportsPage = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [canFetch, setCanFetch] = useState(false);

  const { data: report, isLoading, isError, refetch } = useQuery<IReportData>({
    queryKey: ['adminReport', startDate, endDate],
    queryFn: () => fetchReport(startDate!, endDate!),
    enabled: canFetch, // Only run the query when enabled
  });

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      setCanFetch(true);
      // Manually trigger a refetch
      refetch();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>System Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
          <DatePicker label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
          <DatePicker label="End Date" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
          <Button variant="contained" onClick={handleGenerateReport} disabled={isLoading}>
            Generate Report
          </Button>
        </Box>

        {isLoading && <CircularProgress />}
        {isError && <Alert severity="error">Failed to generate report. Please check the date range.</Alert>}

        {report && (
          <Box>
            <Typography variant="h5" gutterBottom>Report for {report.reportPeriod.from} to {report.reportPeriod.to}</Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}><Typography variant="h6">User Growth</Typography></Grid>
              <Grid item xs={12} sm={6}><StatCard title="New Candidates" value={report.userGrowth.newCandidates} /></Grid>
              <Grid item xs={12} sm={6}><StatCard title="New Schools" value={report.userGrowth.newSchools} /></Grid>

              <Grid item xs={12}><Typography variant="h6">Platform Activity</Typography></Grid>
              <Grid item xs={12} sm={6}><StatCard title="Jobs Posted" value={report.platformActivity.requirementsPosted} /></Grid>
              <Grid item xs={12} sm={6}><StatCard title="Candidates Pushed" value={report.platformActivity.candidatesPushed} /></Grid>

              <Grid item xs={12}><Typography variant="h6">Monetization</Typography></Grid>
              <Grid item xs={12} sm={6}><StatCard title="New Subscriptions" value={report.monetization.newSubscriptions} /></Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};