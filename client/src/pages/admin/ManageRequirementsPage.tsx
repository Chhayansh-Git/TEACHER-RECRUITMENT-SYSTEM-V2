// src/pages/admin/ManageRequirementsPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';

interface IRequirement {
  _id: string;
  title: string;
  school: {
    _id: string;
    name: string;
  };
  status: 'open' | 'closed' | 'filled';
  createdAt: string;
}

// THIS IS THE CORRECTED FUNCTION
const fetchAllRequirements = async (): Promise<IRequirement[]> => {
  const token = localStorage.getItem('token');
  // The URL is now correctly pointed to the admin-only endpoint
  const { data } = await api.get('/admin/requirements', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const ManageRequirementsPage = () => {
  const { data: requirements, isLoading, isError } = useQuery<IRequirement[]>({
    // Using a more specific query key to avoid cache conflicts
    queryKey: ['allAdminRequirements'],
    queryFn: fetchAllRequirements,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Failed to fetch job requirements.</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box mb={3}>
        <Typography variant="h4">Manage Requirements</Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Posted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements?.map((req) => (
              <TableRow key={req._id}>
                <TableCell>{req.title}</TableCell>
                <TableCell>{req.school.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={req.status} 
                    color={req.status === 'open' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    component={RouterLink}
                    to={`/admin/requirements/${req._id}/push`}
                    variant="outlined"
                    size="small"
                  >
                    Push Candidates
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};