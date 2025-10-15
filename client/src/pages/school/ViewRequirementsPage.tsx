// src/pages/school/ViewRequirementsPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

// New API function to delete a requirement
const deleteRequirement = async (id: string) => {
    const token = localStorage.getItem('token');
    const { data } = await api.delete(`/requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const ViewRequirementsPage = () => {
  const queryClient = useQueryClient();
  const { data: requirements, isLoading, isError } = useQuery<IRequirement[]>({
    queryKey: ['schoolRequirements'],
    queryFn: fetchRequirements,
  });

  const deleteMutation = useMutation({
      mutationFn: deleteRequirement,
      onSuccess: () => {
          toast.success('Requirement deleted successfully!');
          queryClient.invalidateQueries({ queryKey: ['schoolRequirements'] });
      },
      onError: () => {
          toast.error('Failed to delete requirement.');
      }
  });

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to permanently delete this job posting? This action cannot be undone.')) {
        deleteMutation.mutate(id);
      }
  };

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
                <TableCell align="right">Actions</TableCell>
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
                  <TableCell align="right">
                    <Tooltip title="Edit Requirement">
                      <IconButton component={RouterLink} to={`/school/requirements/edit/${req._id}`}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Requirement">
                      <IconButton onClick={() => handleDelete(req._id)} color="error" disabled={deleteMutation.isPending}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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