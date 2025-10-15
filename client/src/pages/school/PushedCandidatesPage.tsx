// src/pages/school/PushedCandidatesPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from '@mui/material';

// Import the new modal component
import { SendOfferModal } from '../../components/school/SendOfferModal';
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
  status: 'pushed' | 'viewed' | 'shortlisted' | 'interview scheduled' | 'offer sent' | 'hired' | 'rejected';
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
  const { data } = await api.put(`/school/pushed-candidates/${pushId}/shortlist`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const PushedCandidatesPage = () => {
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<IPushedCandidate | null>(null);
  const queryClient = useQueryClient();

  const { data: candidates, isLoading, isError } = useQuery<IPushedCandidate[]>({
    queryKey: ['pushedCandidates'],
    queryFn: fetchPushedCandidates,
  });

  const shortlistMutation = useMutation({
    mutationFn: shortlistCandidate,
    onSuccess: () => {
      toast.success('Candidate shortlisted!');
      queryClient.invalidateQueries({ queryKey: ['pushedCandidates'] });
    },
    onError: () => {
        toast.error('Failed to shortlist candidate.');
    }
  });

  const handleOpenInterviewModal = (candidate: IPushedCandidate) => {
    setSelectedCandidate(candidate);
    setInterviewModalOpen(true);
  };
  
  const handleOpenOfferModal = (candidate: IPushedCandidate) => {
    setSelectedCandidate(candidate);
    setOfferModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedCandidate(null);
    setInterviewModalOpen(false);
    setOfferModalOpen(false);
  };

  const getStatusChip = (status: IPushedCandidate['status']) => {
      let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
      switch (status) {
          case 'shortlisted': color = 'primary'; break;
          case 'interview scheduled': color = 'secondary'; break;
          case 'offer sent': color = 'info'; break;
          case 'hired': color = 'success'; break;
          case 'rejected': color = 'error'; break;
      }
      return <Chip label={status} color={color} size="small" />;
  }

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch recommended candidates.</Alert>;

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Box mb={3}>
          <Typography variant="h4">Recommended Candidates</Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate Name</TableCell>
                <TableCell>For Requirement</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Pushed</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates?.map((pushed) => (
                <TableRow key={pushed._id}>
                  <TableCell>{pushed.candidate.name}</TableCell>
                  <TableCell>{pushed.requirement.title}</TableCell>
                  <TableCell>{getStatusChip(pushed.status)}</TableCell>
                  <TableCell>{new Date(pushed.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="outlined">View Profile</Button>
                        {pushed.status === 'pushed' && (
                          <Button size="small" variant="contained" onClick={() => shortlistMutation.mutate(pushed._id)} disabled={shortlistMutation.isPending}>Shortlist</Button>
                        )}
                        {pushed.status === 'shortlisted' && (
                           <Button size="small" variant="contained" color="secondary" onClick={() => handleOpenInterviewModal(pushed)}>Schedule Interview</Button>
                        )}
                        {/* Allow sending offer after interview or even just after shortlisting */}
                        {(pushed.status === 'shortlisted' || pushed.status === 'interview scheduled') && (
                           <Button size="small" variant="contained" color="success" onClick={() => handleOpenOfferModal(pushed)}>Send Offer</Button>
                        )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedCandidate && (
        <>
            <ScheduleInterviewModal
              open={interviewModalOpen}
              onClose={handleCloseModals}
              pushId={selectedCandidate._id}
              candidateName={selectedCandidate.candidate.name}
            />
            <SendOfferModal
              open={offerModalOpen}
              onClose={handleCloseModals}
              pushedCandidateId={selectedCandidate._id}
              candidateName={selectedCandidate.candidate.name}
              jobTitle={selectedCandidate.requirement.title}
            />
        </>
      )}
    </>
  );
};