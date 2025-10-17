// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/pages/school/PushedCandidatesPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
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
  Collapse,
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Import the modal components
import { SendOfferModal } from '../../components/school/SendOfferModal';
import { ScheduleInterviewModal } from '../../components/school/ScheduleInterviewModal';
import { CandidateProfileModal } from '../../components/school/CandidateProfileModal'; // Import the new modal

// --- Types remain the same from the previous step ---
interface ICandidateSubDoc {
  _id: string; 
  status: 'pushed' | 'viewed' | 'shortlisted' | 'interview scheduled' | 'offer sent' | 'hired' | 'rejected';
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface IGroupedCandidates {
  requirement: {
    _id: string;
    title: string;
    location: string;
  };
  candidates: ICandidateSubDoc[];
}

const fetchPushedCandidates = async (): Promise<IGroupedCandidates[]> => {
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

// --- Row Component ---
function Row(props: { group: IGroupedCandidates }) {
  const { group } = props;
  const [open, setOpen] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<ICandidateSubDoc | null>(null);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false); // State for the new modal
  const [viewingCandidateId, setViewingCandidateId] = useState<string | null>(null); // State for the ID
  const queryClient = useQueryClient();

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

  const handleOpenInterviewModal = (candidate: ICandidateSubDoc) => {
    setSelectedCandidate(candidate);
    setInterviewModalOpen(true);
  };

  const handleOpenOfferModal = (candidate: ICandidateSubDoc) => {
    setSelectedCandidate(candidate);
    setOfferModalOpen(true);
  };
  
  // --- NEW HANDLERS FOR THE PROFILE MODAL ---
  const handleOpenProfileModal = (candidateId: string) => {
    setViewingCandidateId(candidateId);
    setProfileModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedCandidate(null);
    setInterviewModalOpen(false);
    setOfferModalOpen(false);
    setProfileModalOpen(false); // Close the profile modal
    setViewingCandidateId(null);
  };
  // --- END NEW HANDLERS ---

  const getStatusChip = (status: ICandidateSubDoc['status']) => {
      let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
      switch (status) {
          case 'pushed': color = 'default'; break;
          case 'viewed': color = 'info'; break;
          case 'shortlisted': color = 'primary'; break;
          case 'interview scheduled': color = 'secondary'; break;
          case 'offer sent': color = 'warning'; break;
          case 'hired': color = 'success'; break;
          case 'rejected': color = 'error'; break;
      }
      return <Chip label={status} color={color} size="small" sx={{ textTransform: 'capitalize' }} />;
  }

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="subtitle1" fontWeight="bold">{group.requirement.title}</Typography>
          <Typography variant="body2" color="text.secondary">{group.requirement.location}</Typography>
        </TableCell>
        <TableCell align="right">
            <Chip label={`${group.candidates.length} Candidates`} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="candidates">
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate Name</TableCell>
                    <TableCell>Date Pushed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.candidates.map((candidateDoc) => (
                    <TableRow key={candidateDoc._id}>
                      <TableCell>{candidateDoc.candidate.name}</TableCell>
                      <TableCell>{new Date(candidateDoc.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusChip(candidateDoc.status)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {/* --- UPDATED ONCLICK HANDLER --- */}
                            <Button size="small" variant="outlined" onClick={() => handleOpenProfileModal(candidateDoc.candidate._id)}>View Profile</Button>
                            {candidateDoc.status === 'pushed' && (
                              <Button size="small" variant="contained" onClick={() => shortlistMutation.mutate(candidateDoc._id)} disabled={shortlistMutation.isPending}>Shortlist</Button>
                            )}
                            {candidateDoc.status === 'shortlisted' && (
                               <Button size="small" variant="contained" color="secondary" onClick={() => handleOpenInterviewModal(candidateDoc)}>Schedule Interview</Button>
                            )}
                            {(candidateDoc.status === 'shortlisted' || candidateDoc.status === 'interview scheduled') && (
                               <Button size="small" variant="contained" color="success" onClick={() => handleOpenOfferModal(candidateDoc)}>Send Offer</Button>
                            )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Modals */}
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
              jobTitle={group.requirement.title}
            />
        </>
      )}
      {/* --- ADD THE NEW MODAL TO THE RENDER --- */}
      <CandidateProfileModal 
        open={profileModalOpen}
        onClose={handleCloseModals}
        candidateId={viewingCandidateId}
      />
    </>
  );
}


export const PushedCandidatesPage = () => {
  const { data: groupedCandidates, isLoading, isError } = useQuery<IGroupedCandidates[]>({
    queryKey: ['pushedCandidates'],
    queryFn: fetchPushedCandidates,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch recommended candidates.</Alert>;

  return (
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box mb={3}>
          <Typography variant="h4">Recommended Candidates</Typography>
          <Typography variant="body1" color="text.secondary">
            Candidates recommended by the admin, grouped by job requirement.
          </Typography>
        </Box>

        {groupedCandidates && groupedCandidates.length > 0 ? (
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Job Requirement</TableCell>
                  <TableCell align="right">Recommendations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedCandidates.map((group) => (
                  <Row key={group.requirement._id} group={group} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 4, textAlign: 'center' }}>
            No candidates have been recommended to you yet.
          </Typography>
        )}
      </Paper>
  );
};