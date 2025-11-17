// client/src/pages/school/AcceptInvitationPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

interface IInvitationDetails {
  organization: {
    name: string;
  };
}

const fetchInvitationDetails = async (token: string): Promise<IInvitationDetails> => {
  const authToken = localStorage.getItem('token');
  const { data } = await api.get(`/school/invitation/${token}`, { headers: { Authorization: `Bearer ${authToken}` } });
  return data;
};

const acceptInvitation = async (token: string) => {
  const authToken = localStorage.getItem('token');
  const { data } = await api.post(`/school/invitation/${token}/accept`, {}, { headers: { Authorization: `Bearer ${authToken}` } });
  return data;
};

export const AcceptInvitationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data: invitation, isLoading, isError, error } = useQuery<IInvitationDetails>({
    queryKey: ['invitationDetails', token],
    queryFn: () => fetchInvitationDetails(token!),
    enabled: !!token,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept the invitation.');
    }
  });

  const handleAccept = () => {
    if (token) {
      mutation.mutate(token);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4, textAlign: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Join Organization
        </Typography>
        {isLoading && <CircularProgress />}
        {isError && <Alert severity="error">{(error as any).response?.data?.message || 'This invitation is invalid or has expired.'}</Alert>}
        {invitation && (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You have been invited to join the <strong>{invitation.organization.name}</strong> school group.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleAccept}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <CircularProgress size={24} /> : `Accept Invitation to Join ${invitation.organization.name}`}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};