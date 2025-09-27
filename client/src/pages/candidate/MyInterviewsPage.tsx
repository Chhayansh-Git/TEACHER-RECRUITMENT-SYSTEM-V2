// src/pages/candidate/MyInterviewsPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Card, CardContent, CardActions, Button, Chip, Divider } from '@mui/material';

interface IInterview {
  _id: string;
  school: { name: string };
  interviewDate: string;
  interviewType: 'Online' | 'In-person';
  locationOrLink: string;
  status: 'Scheduled' | 'Accepted' | 'Declined' | 'Completed';
}

const fetchMyInterviews = async (): Promise<IInterview[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/interviews/my-interviews', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const respondToInterview = async ({ interviewId, status }: { interviewId: string, status: 'Accepted' | 'Declined' }) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put(`/interviews/${interviewId}/respond`, { status }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const MyInterviewsPage = () => {
  const queryClient = useQueryClient();
  const { data: interviews, isLoading, isError } = useQuery<IInterview[]>({
    queryKey: ['myInterviews'],
    queryFn: fetchMyInterviews,
  });

  const mutation = useMutation({
    mutationFn: respondToInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
    },
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not fetch your interviews.</Alert>;

  return (
    <Paper sx={{ p: 4, backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Typography variant="h4" gutterBottom>My Interviews</Typography>
      {interviews && interviews.length > 0 ? (
        interviews.map(interview => (
          <Card key={interview._id} sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">Interview with {interview.school.name}</Typography>
                  <Typography variant="body1">
                    {new Date(interview.interviewDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {interview.interviewType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location/Link: {interview.locationOrLink}
                  </Typography>
                </Box>
                <Chip label={interview.status} color={
                    interview.status === 'Accepted' ? 'success' : 
                    interview.status === 'Declined' ? 'error' : 
                    'primary'
                }/>
              </Box>
            </CardContent>
            {interview.status === 'Scheduled' && (
              <>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button color="error" onClick={() => mutation.mutate({ interviewId: interview._id, status: 'Declined' })}>Decline</Button>
                  <Button variant="contained" onClick={() => mutation.mutate({ interviewId: interview._id, status: 'Accepted' })}>Accept</Button>
                </CardActions>
              </>
            )}
          </Card>
        ))
      ) : (
        <Typography>You have no scheduled interviews at this time.</Typography>
      )}
    </Paper>
  );
};