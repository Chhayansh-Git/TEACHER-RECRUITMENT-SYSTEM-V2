// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/components/school/RequirementDetailsModal.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Import the new component
import { PipelineCandidateRow } from './PipelineCandidateRow';

// Types
interface IRequirementSummary {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  status: 'open' | 'closed' | 'filled';
  createdAt: string;
}

interface ICandidateInPipeline {
    _id: string;
    candidate: { _id: string; name: string; };
    status: string;
    timeline: { event: string; date: string; }[];
}

interface IRequirementDetails {
    requirement: IRequirementSummary & {
        description: string;
        subject: string;
        gradeLevel: string;
        qualifications: string[];
        experienceRequired: string;
        salary?: number;
        benefits: string[];
    };
    candidates: ICandidateInPipeline[];
}


const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: '70%', lg: '60%' },
  maxWidth: '900px',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const fetchRequirementDetails = async (id: string): Promise<IRequirementDetails> => {
    const token = localStorage.getItem('token');
    const { data } = await api.get(`/school/requirements/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
}

interface RequirementDetailsModalProps {
  open: boolean;
  onClose: () => void;
  requirementId: string | null;
}

export const RequirementDetailsModal = ({ open, onClose, requirementId }: RequirementDetailsModalProps) => {
  const { data: details, isLoading, isError, error } = useQuery<IRequirementDetails>({
    queryKey: ['requirementDetails', requirementId],
    queryFn: () => fetchRequirementDetails(requirementId!),
    enabled: !!requirementId,
    retry: false,
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        
        {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', p: 5}}><CircularProgress /></Box>}
        {isError && <Alert severity="error">{(error as any)?.response?.data?.message || 'Could not load details.'}</Alert>}
        
        {details && (
            <>
                <Typography variant="h4" gutterBottom>{details.requirement.title}</Typography>
                <Grid container spacing={3}>
                    {/* Left Side: Full Requirement Details */}
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" gutterBottom>Job Details</Typography>
                        <Divider sx={{mb: 2}} />
                        <Typography variant="body1"><strong>Status:</strong> <Chip label={details.requirement.status} color={details.requirement.status === 'open' ? 'success' : 'default'} size="small" /></Typography>
                        <Typography variant="body1"><strong>Subject:</strong> {details.requirement.subject}</Typography>
                        <Typography variant="body1"><strong>Grade Level:</strong> {details.requirement.gradeLevel}</Typography>
                        <Typography variant="body1"><strong>Location:</strong> {details.requirement.location}</Typography>
                        <Typography variant="body1"><strong>Experience:</strong> {details.requirement.experienceRequired}</Typography>
                        <Typography variant="body1"><strong>Salary:</strong> {details.requirement.salary ? `₹${details.requirement.salary.toLocaleString()}` : 'Not Disclosed'}</Typography>
                        
                        <Typography variant="subtitle2" sx={{mt: 2, mb: 1}}><strong>Qualifications:</strong></Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {details.requirement.qualifications.map(q => <Chip key={q} label={q} size="small" />)}
                        </Box>
                        
                        <Typography variant="subtitle2" sx={{mt: 2, mb: 1}}><strong>Benefits:</strong></Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {details.requirement.benefits.map(b => <Chip key={b} label={b} size="small" />)}
                        </Box>

                        <Typography variant="subtitle2" sx={{mt: 2, mb: 1}}><strong>Description:</strong></Typography>
                        <Paper variant="outlined" sx={{p: 2, maxHeight: 150, overflowY: 'auto'}}>
                           <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{details.requirement.description}</Typography>
                        </Paper>
                    </Grid>

                    {/* Right Side: Candidate Pipeline */}
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" gutterBottom>Candidate Pipeline</Typography>
                        <Divider sx={{mb: 2}} />
                         {details.candidates.length > 0 ? (
                            <TableContainer component={Paper}>
                                <Table size="small" aria-label="candidate pipeline">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Candidate</TableCell>
                                            <TableCell>Current Status</TableCell>
                                            <TableCell>Date Recommended</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.candidates.map(candidateData => (
                                            <PipelineCandidateRow key={candidateData._id} candidateData={candidateData} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>No candidates have been pushed for this requirement yet.</Typography>
                        )}
                    </Grid>
                </Grid>
            </>
        )}
      </Box>
    </Modal>
  );
};