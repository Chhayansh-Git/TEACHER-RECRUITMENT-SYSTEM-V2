// src/pages/admin/PushCandidatePage.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';

interface IRequirement {
  _id: string;
  title: string;
  school: { name: string };
}

interface ICandidate {
  _id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
}

// Function to get a single requirement's details
const fetchRequirementDetails = async (id: string): Promise<IRequirement> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get(`/admin/requirements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

// THIS IS THE NEW, INTELLIGENT DATA-FETCHING FUNCTION
const fetchRankedCandidates = async (requirementId: string): Promise<ICandidate[]> => {
    const token = localStorage.getItem('token');
    const { data } = await api.get(`/admin/requirements/${requirementId}/ranked-candidates`, { headers: { Authorization: `Bearer ${token}` } });
    return data;
};

const pushCandidate = async ({ candidateId, requirementId }: { candidateId: string; requirementId: string }) => {
    const token = localStorage.getItem('token');
    const { data } = await api.post('/admin/push', { candidateId, requirementId }, { headers: { Authorization: `Bearer ${token}` } });
    return data;
};

export const PushCandidatePage = () => {
  const { requirementId } = useParams<{ requirementId: string }>();
  const [pushedCandidates, setPushedCandidates] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: requirement, isLoading: isLoadingRequirement } = useQuery({
    queryKey: ['requirementDetails', requirementId],
    queryFn: () => fetchRequirementDetails(requirementId!),
    enabled: !!requirementId,
  });

  // This now calls our new AI-powered endpoint
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['rankedCandidates', requirementId],
    queryFn: () => fetchRankedCandidates(requirementId!),
    enabled: !!requirementId,
  });

  const mutation = useMutation({
    mutationFn: pushCandidate,
    onSuccess: (data) => {
      setPushedCandidates(prev => [...prev, data.candidate]);
    },
  });

  const handlePush = (candidateId: string) => {
    if (requirementId) {
      mutation.mutate({ candidateId, requirementId });
    }
  };

  if (isLoadingRequirement || isLoadingCandidates) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4 }}>
      <Box mb={4}>
        <Typography variant="h4">AI-Ranked Candidates</Typography>
        {requirement && (
          <Typography variant="h6" color="text.secondary">
            Top matches for: "{requirement.title}" at {requirement.school.name}
          </Typography>
        )}
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Profile Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates?.map((candidate, index) => {
              const isPushed = pushedCandidates.includes(candidate._id);
              return (
                <TableRow key={candidate._id} sx={{ backgroundColor: index < 3 ? 'rgba(46, 204, 113, 0.1)' : 'inherit' }}>
                  <TableCell>
                    <Typography fontWeight="bold">#{index + 1}</Typography>
                  </TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={candidate.profileCompleted ? 'Completed' : 'Incomplete'} 
                      color={candidate.profileCompleted ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isPushed || mutation.isPending}
                      onClick={() => handlePush(candidate._id)}
                    >
                      {isPushed ? 'Pushed' : 'Push'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};