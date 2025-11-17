// client/src/pages/group-admin/ManageSchoolsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface ISchool {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

const fetchManagedSchools = async (): Promise<ISchool[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/group-admin/schools', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const sendInvitation = async (email: string) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/group-admin/invitations', { email }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const removeSchool = async (schoolId: string) => {
    const token = localStorage.getItem('token');
    const { data } = await api.delete(`/group-admin/schools/${schoolId}`, { headers: { Authorization: `Bearer ${token}` } });
    return data;
}

export const ManageSchoolsPage = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [emailToInvite, setEmailToInvite] = useState('');
  const queryClient = useQueryClient();

  const { data: schools, isLoading, isError } = useQuery<ISchool[]>({
    queryKey: ['managedSchools'],
    queryFn: fetchManagedSchools,
  });

  const invitationMutation = useMutation({
    mutationFn: sendInvitation,
    onSuccess: (data) => {
      toast.success(data.message);
      setInviteModalOpen(false);
      setEmailToInvite('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation.');
    }
  });

  const removeMutation = useMutation({
      mutationFn: removeSchool,
      onSuccess: (data) => {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: ['managedSchools'] });
      },
      onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to remove school.');
      }
  });

  const handleSendInvite = () => {
    if (emailToInvite) {
      invitationMutation.mutate(emailToInvite);
    }
  };

  const handleRemoveSchool = (schoolId: string, schoolName: string) => {
      if (window.confirm(`Are you sure you want to remove ${schoolName} from your organization? This action cannot be undone.`)) {
          removeMutation.mutate(schoolId);
      }
  }

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch managed schools.</Alert>;

  return (
    <>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Manage Schools</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInviteModalOpen(true)}
          >
            Invite New School
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>School Name</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Date Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools?.map((school) => (
                <TableRow key={school._id} hover>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.email}</TableCell>
                  <TableCell>{new Date(school.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remove from Group">
                      <IconButton onClick={() => handleRemoveSchool(school._id, school.name)} color="error" disabled={removeMutation.isPending}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
         {(!schools || schools.length === 0) && (
            <Typography sx={{ mt: 4, textAlign: 'center' }}>
                You have not added any schools to your group yet. Use the "Invite New School" button to get started.
            </Typography>
        )}
      </Paper>

      {/* Invite School Dialog */}
      <Dialog open={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <DialogTitle>Invite a New School</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the email address of the school administrator you wish to invite. They must have or create a 'school' account on TeacherRecruit to accept.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="School Admin Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={emailToInvite}
            onChange={(e) => setEmailToInvite(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSendInvite} variant="contained" disabled={invitationMutation.isPending}>
            {invitationMutation.isPending ? <CircularProgress size={24} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};