// src/pages/candidate/MyOffersPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Paper, Card, CardContent, CardActions, Button, Chip, Divider, Grid, Avatar } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

const API_BASE_URL = 'http://localhost:5001';

interface IOfferLetter {
  _id: string;
  school: {
    name: string;
    profilePictureUrl?: string;
  };
  jobTitle: string;
  offeredSalary: number;
  joiningDate: string;
  offerDetails: string;
  status: 'sent' | 'accepted' | 'rejected' | 'withdrawn';
}

const fetchMyOffers = async (): Promise<IOfferLetter[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/offers/my-offers', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const respondToOffer = async ({ offerId, status }: { offerId: string; status: 'accepted' | 'rejected' }) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put(`/offers/${offerId}/respond`, { status }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const MyOffersPage = () => {
  const queryClient = useQueryClient();
  const { data: offers, isLoading, isError } = useQuery<IOfferLetter[]>({
    queryKey: ['myOffers'],
    queryFn: fetchMyOffers,
  });

  const mutation = useMutation({
    mutationFn: respondToOffer,
    onSuccess: (data) => {
      toast.success(`You have successfully ${data.status} the offer.`);
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to respond to the offer.');
    }
  });

  const getStatusChip = (status: IOfferLetter['status']) => {
    let color: "default" | "primary" | "error" | "success" | "warning" = "primary";
    switch (status) {
        case 'accepted': color = 'success'; break;
        case 'rejected': color = 'error'; break;
        case 'withdrawn': color = 'warning'; break;
    }
    return <Chip label={status} color={color} sx={{ textTransform: 'capitalize' }} />;
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not fetch your job offers.</Alert>;

  return (
    <Paper sx={{ p: 4, backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Typography variant="h4" gutterBottom>My Job Offers</Typography>
      
      {offers && offers.length > 0 ? (
        <Grid container spacing={3}>
          {offers.map(offer => (
            <Grid item xs={12} key={offer._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Avatar 
                          src={offer.school.profilePictureUrl ? `${API_BASE_URL}${offer.school.profilePictureUrl}` : undefined}
                          sx={{ width: 56, height: 56 }}
                       >
                         <BusinessIcon />
                       </Avatar>
                       <Box>
                         <Typography variant="h6">{offer.jobTitle}</Typography>
                         <Typography color="text.secondary">Offer from: {offer.school.name}</Typography>
                       </Box>
                    </Box>
                    {getStatusChip(offer.status)}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Offered Salary (Annual)</Typography>
                      <Typography variant="h6">₹{offer.offeredSalary.toLocaleString('en-IN')}</Typography>
                    </Grid>
                     <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Proposed Joining Date</Typography>
                      <Typography variant="h6">{new Date(offer.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Typography>
                    </Grid>
                     <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Offer Details</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{offer.offerDetails}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                {offer.status === 'sent' && (
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button 
                      color="error" 
                      onClick={() => mutation.mutate({ offerId: offer._id, status: 'rejected' })}
                      disabled={mutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => mutation.mutate({ offerId: offer._id, status: 'accepted' })}
                      disabled={mutation.isPending}
                    >
                      Accept Offer
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>You have not received any job offers at this time.</Typography>
      )}
    </Paper>
  );
};