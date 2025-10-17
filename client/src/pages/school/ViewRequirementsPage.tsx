// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/pages/school/ViewRequirementsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import VisibilityIcon from '@mui/icons-material/Visibility';

// Import the modal and the custom hook
import { RequirementDetailsModal } from '../../components/school/RequirementDetailsModal';
import { useSubscription } from '../../hooks/useSubscription';

interface IRequirementSummary {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  status: 'open' | 'closed' | 'filled';
  createdAt: string;
}

const fetchRequirements = async (): Promise<IRequirementSummary[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/requirements', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const deleteRequirement = async (id: string) => {
    const token = localStorage.getItem('token');
    const { data } = await api.delete(`/requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const ViewRequirementsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Use the navigate hook
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);

  const { data: plan, isLoading: isLoadingPlan } = useSubscription();

  const { data: requirements, isLoading: isLoadingRequirements, isError } = useQuery<IRequirementSummary[]>({
    queryKey: ['schoolRequirements'],
    queryFn: fetchRequirements,
  });

  const activeJobs = requirements?.filter(r => r.status === 'open').length || 0;
  const canPostJob = plan ? (plan.maxJobs === -1 || activeJobs < plan.maxJobs) : false;

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
      if (window.confirm('Are you sure you want to permanently delete this job posting?')) {
        deleteMutation.mutate(id);
      }
  };

  const handleOpenModal = (id: string) => {
    setSelectedRequirementId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequirementId(null);
  };

  // --- SMART NAVIGATION HANDLER ---
  const handlePostJobClick = () => {
    if (canPostJob) {
        navigate('/school/requirements/new');
    } else {
        toast.error(`Your '${plan?.name}' plan only allows for ${plan?.maxJobs} active job(s).`);
        navigate('/school/subscription');
    }
  };


  if (isLoadingRequirements || isLoadingPlan) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch job requirements.</Alert>;

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4">My Job Postings</Typography>
            {plan && plan.maxJobs !== -1 && (
                <Typography color="text.secondary">
                    {activeJobs} / {plan.maxJobs} active job slots used.
                </Typography>
            )}
          </Box>
          <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handlePostJobClick} // Use the smart handler
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
                  <TableCell>Status</TableCell>
                  <TableCell>Date Posted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req._id} hover>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>{req.location}</TableCell>
                    <TableCell>
                      <Chip label={req.status} color={req.status === 'open' ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details & Pipeline">
                        <IconButton onClick={() => handleOpenModal(req._id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
           <Box sx={{ mt: 8, textAlign: 'center', p: 3, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
              <Typography variant="h6">No Job Postings Found</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Click the "Post New Job" button to create your first requirement and start receiving candidate recommendations.
              </Typography>
          </Box>
        )}
      </Paper>
      
      <RequirementDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        requirementId={selectedRequirementId}
      />
    </>
  );
};