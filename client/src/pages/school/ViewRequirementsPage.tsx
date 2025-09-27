// src/pages/school/ViewRequirementsPage.tsx

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
  Button,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Define the type for a requirement, matching our backend model
interface IRequirement {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  status: 'open' | 'closed' | 'filled';
  createdAt: string;
}

// Function to fetch requirements from the API
const fetchRequirements = async (): Promise<IRequirement[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/requirements', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const ViewRequirementsPage = () => {
  const { data: requirements, isLoading, isError } = useQuery<IRequirement[]>({
    queryKey: ['schoolRequirements'],
    queryFn: fetchRequirements,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Failed to fetch job requirements.</Alert>;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Job Postings</Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/school/requirements/new"
          startIcon={<AddIcon />}
        >
          Post New Job
        </Button>
      </Box>

      {requirements && requirements.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Posted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requirements.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{req.title}</TableCell>
                  <TableCell>{req.location}</TableCell>
                  <TableCell>{req.employmentType}</TableCell>
                  <TableCell>
                    <Chip 
                      label={req.status} 
                      color={req.status === 'open' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">View Applicants</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
         <Typography sx={{ mt: 4, textAlign: 'center' }}>
            You have not posted any job requirements yet.
        </Typography>
      )}
    </Paper>
  );
};