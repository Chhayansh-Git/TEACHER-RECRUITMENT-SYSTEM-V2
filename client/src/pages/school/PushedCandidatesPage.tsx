// src/pages/school/PushedCandidatesPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Button,
  Chip
} from '@mui/material';

import { ScheduleInterviewModal } from '../../components/school/ScheduleInterviewModal';

interface IPushedCandidate {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  requirement: {
    _id: string;
    title: string;
  };
  status: string;
  createdAt: string;
}

const fetchPushedCandidates = async (): Promise<IPushedCandidate[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/school/pushed-candidates', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const shortlistCandidate = async (pushId: string) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put(
    `/school/pushed-candidates/${pushId}/shortlist`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const PushedCandidatesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<IPushedCandidate | null>(null);
  const queryClient = useQueryClient();

  const { data: candidates, isLoading, isError } = useQuery<IPushedCandidate[]>({
    queryKey: ['pushedCandidates'],
    queryFn: fetchPushedCandidates,
  });

  const shortlistMutation = useMutation({
    mutationFn: shortlistCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pushedCandidates'] });
    },
  });

  const handleOpenModal = (candidate: IPushedCandidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCandidate(null);
    setModalOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to fetch recommended candidates.</Alert>;
  }

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Box mb={3}>
          <Typography variant="h4">Recommended Candidates</Typography>
        </Box>

        {candidates && candidates.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate Name</TableCell>
                  <TableCell>For Requirement</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date Pushed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((pushed) => (
                  <TableRow key={pushed._id}>
                    <TableCell>{pushed.candidate.name}</TableCell>
                    <TableCell>{pushed.requirement.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={pushed.status}
                        color={
                          pushed.status === 'shortlisted'
                            ? 'primary'
                            : pushed.status === 'interview scheduled'
                            ? 'secondary'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(pushed.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                        View Profile
                      </Button>
                      {pushed.status === 'pushed' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => shortlistMutation.mutate(pushed._id)}
                          disabled={shortlistMutation.isPending}
                        >
                          Shortlist
                        </Button>
                      )}
                      {pushed.status === 'shortlisted' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => handleOpenModal(pushed)}
                        >
                          Schedule Interview
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No candidates available.</Typography>
        )}
      </Paper>

      {selectedCandidate && (
        <ScheduleInterviewModal
          open={modalOpen}
          onClose={handleCloseModal}
          pushId={selectedCandidate._id}
          candidateName={selectedCandidate.candidate.name}
        />
      )}
    </>
  );
};
