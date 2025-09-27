// src/pages/school/SubscriptionPage.tsx

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';

// MUI Components
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardHeader, CardContent, CardActions, Button, List, ListItem, ListItemIcon } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface IPlan {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
}

const fetchPlans = async (): Promise<IPlan[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/plans', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const createOrder = async (planId: string) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/payments/create-order', { planId }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const verifyPayment = async (paymentData: any) => {
    const token = localStorage.getItem('token');
    const { data } = await api.post('/payments/verify-payment', paymentData, { headers: { Authorization: `Bearer ${token}` } });
    return data;
};

export const SubscriptionPage = () => {
  const { userInfo } = useAppSelector(state => state.auth);

  const { data: plans, isLoading, isError } = useQuery<IPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchPlans,
  });

  const verifyMutation = useMutation({ mutationFn: verifyPayment });

  const handlePayment = async (plan: IPlan) => {
    try {
      const order = await createOrder(plan._id);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add your Razorpay Key ID to a .env.local file in the client directory
        amount: order.amount,
        currency: order.currency,
        name: 'Teacher Recruitment System',
        description: `Subscription for ${plan.name} Plan`,
        order_id: order.id,
        handler: function (response: any) {
          verifyMutation.mutate({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan._id,
          });
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
        },
        theme: {
          color: '#1976d2',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment failed', error);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not load subscription plans.</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Subscription Plans</Typography>
      {verifyMutation.isSuccess && <Alert severity="success">Subscription activated successfully!</Alert>}
       {verifyMutation.isError && <Alert severity="error">Payment verification failed. Please contact support.</Alert>}
      <Grid container spacing={4} alignItems="flex-end">
        {plans?.map((plan) => (
          <Grid item key={plan._id} xs={12} sm={6} md={4}>
            <Card>
              <CardHeader title={plan.name} subheader={`₹${plan.price} / ${plan.durationInDays} days`} titleTypographyProps={{ align: 'center' }} subheaderTypographyProps={{ align: 'center' }} sx={{ backgroundColor: (theme) => theme.palette.grey[200] }} />
              <CardContent>
                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature}>
                      <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                      <Typography variant="subtitle1">{feature}</Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button fullWidth variant="contained" onClick={() => handlePayment(plan)}>
                  Subscribe
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};