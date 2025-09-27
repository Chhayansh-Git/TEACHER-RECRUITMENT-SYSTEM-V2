// src/pages/admin/ManageCandidatesPage.tsx

import { useQuery } from '@tanstack/react-query';
import api from '../../api';

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
  Chip
} from '@mui/material';

interface ICandidate {
  _id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  createdAt: string;
}

const fetchAllCandidates = async (): Promise<ICandidate[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/admin/candidates', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const ManageCandidatesPage = () => {
  const { data: candidates, isLoading, isError } = useQuery<ICandidate[]>({
    queryKey: ['allCandidates'],
    queryFn: fetchAllCandidates,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch candidates.</Alert>;

  return (
    <Paper sx={{ p: 4 }}>
      <Box mb={3}>
        <Typography variant="h4">Manage Candidates</Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Profile Status</TableCell>
              <TableCell>Date Registered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates?.map((candidate) => (
              <TableRow key={candidate._id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={candidate.profileCompleted ? 'Completed' : 'Incomplete'} 
                    color={candidate.profileCompleted ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};