// src/pages/admin/PipelinePage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

interface IPipelineEntry {
  _id: string;
  candidate: { name: string; email: string };
  school: { name: string };
  requirement: { title: string };
  status: string;
  createdAt: string;
}

const fetchPipeline = async (): Promise<IPipelineEntry[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/admin/pipeline', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const PipelinePage = () => {
  const { data: pipeline, isLoading, isError } = useQuery<IPipelineEntry[]>({
    queryKey: ['adminPipeline'],
    queryFn: fetchPipeline,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load the recruitment pipeline.</Alert>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'primary';
      case 'interview scheduled': return 'secondary';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box mb={3}>
        <Typography variant="h4">Recruitment Pipeline</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Requirement</TableCell>
              <TableCell>Date Pushed</TableCell>
              <TableCell>Current Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pipeline?.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>{entry.candidate.name}</TableCell>
                <TableCell>{entry.school.name}</TableCell>
                <TableCell>{entry.requirement.title}</TableCell>
                <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={entry.status} color={getStatusColor(entry.status)} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};