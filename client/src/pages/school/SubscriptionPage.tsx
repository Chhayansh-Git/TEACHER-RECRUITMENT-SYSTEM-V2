// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/client/src/pages/school/SubscriptionPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';
import toast from 'react-hot-toast';

// MUI Components
import {
  Box, Typography, CircularProgress, Alert, Grid, Card, CardHeader,
  CardContent, CardActions, Button, List, ListItem, ListItemIcon,
  Switch, FormControlLabel, Chip, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

// ... (Interface definitions and API calls remain the same)
interface IPlan {
  _id: string;
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  maxJobs: number;
  maxUsers: number;
  candidateMatchesLimit: number;
  canViewFullProfile: boolean;
  weeklyProfileViews: number;
  hasAdvancedAnalytics: boolean;
}

const fetchPlans = async (): Promise<IPlan[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/plans', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const createOrder = async ({ planId, isAnnual }: { planId: string, isAnnual: boolean }) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/payments/create-order', { planId, isAnnual }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const verifyPayment = async (paymentData: any) => {
    const token = localStorage.getItem('token');
    const { data } = await api.post('/payments/verify-payment', paymentData);
    return data;
};


export const SubscriptionPage = () => {
  const { userInfo } = useAppSelector(state => state.auth);
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const { data: plans, isLoading, isError } = useQuery<IPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchPlans,
  });

  const verifyMutation = useMutation({ 
    mutationFn: verifyPayment,
    onSuccess: () => {
      toast.success('Subscription activated successfully! Your plan has been upgraded.');
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error('Payment verification failed. Please contact support.');
    }
  });

  const handlePayment = async (plan: IPlan) => {
    if (plan.name === 'Enterprise') {
        toast('Please contact our sales team to get started with the Enterprise plan.', { icon: '📞' });
        return;
    }

    try {
      const isAnnual = billingCycle === 'annual';
      const order = await createOrder({ planId: plan._id, isAnnual });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'TeacherRecruit',
        description: `Subscription for ${plan.name} Plan (${isAnnual ? 'Annual' : 'Monthly'})`,
        order_id: order.id,
        handler: function (response: any) {
          verifyMutation.mutate({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan._id,
            isAnnual: isAnnual,
          });
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
          contact: userInfo?.phone,
        },
        theme: {
          color: '#1976d2',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Could not load subscription plans.</Alert>;

  const sortedPlans = plans?.sort((a,b) => a.price - b.price);
  const basicPlan = sortedPlans?.find(p => p.name === 'Basic');
  const premiumPlan = sortedPlans?.find(p => p.name === 'Premium');
  const enterprisePlan = sortedPlans?.find(p => p.name === 'Enterprise');

  return (
    <Box>
      <Typography variant="h3" align="center" gutterBottom fontWeight="bold">Find Your Perfect Plan</Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={{mb: 4}}>
        Stop wasting time. Start hiring smarter with our powerful recruitment tools.
      </Typography>
      
      <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
        <Typography>Monthly</Typography>
        <Switch checked={billingCycle === 'annual'} onChange={(e) => setBillingCycle(e.target.checked ? 'annual' : 'monthly')} />
        <Typography>Annual <Chip label="Save ~16%" color="success" size="small" /></Typography>
      </Box>

      {/* --- DETAILED FEATURE COMPARISON TABLE --- */}
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{width: '30%'}}><Typography fontWeight="bold" variant="h6">Features</Typography></TableCell>
                <TableCell align="center" sx={{width: '23%'}}><Typography fontWeight="bold" variant="h6">Basic</Typography></TableCell>
                <TableCell align="center" sx={{width: '23%', border: 2, borderColor: 'primary.main'}}><Typography fontWeight="bold" variant="h6" color="primary">Premium</Typography></TableCell>
                <TableCell align="center" sx={{width: '23%'}}><Typography fontWeight="bold" variant="h6">Enterprise</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {/* Pricing Row */}
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center">
                        <Typography variant="h4" component="div">₹0</Typography>
                        <Typography color="text.secondary">Free Forever</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}>
                        <Typography variant="h4" component="div">₹{billingCycle === 'annual' ? '1,667' : '1,999'}</Typography>
                        <Typography color="text.secondary">/mo{billingCycle === 'annual' && ', billed annually'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                        <Typography variant="h4" component="div">₹{billingCycle === 'annual' ? '4,167' : '4,999'}</Typography>
                        <Typography color="text.secondary">/mo{billingCycle === 'annual' && ', billed annually'}</Typography>
                    </TableCell>
                </TableRow>
                
                {/* Feature Rows */}
                <TableRow hover>
                    <TableCell>Active Job Postings</TableCell>
                    <TableCell align="center">{basicPlan?.maxJobs}</TableCell>
                    <TableCell align="center" sx={{fontWeight: 'bold', color: 'primary.main', borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}>{premiumPlan?.maxJobs}</TableCell>
                    <TableCell align="center">Unlimited</TableCell>
                </TableRow>
                 <TableRow hover>
                    <TableCell>AI Candidate Matches / Job</TableCell>
                    <TableCell align="center">Top {basicPlan?.candidateMatchesLimit}</TableCell>
                    <TableCell align="center" sx={{fontWeight: 'bold', color: 'primary.main', borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}>Unlimited</TableCell>
                    <TableCell align="center">Unlimited</TableCell>
                </TableRow>
                 <TableRow hover>
                    <TableCell>Full Candidate Profile Views</TableCell>
                    <TableCell align="center">{basicPlan?.weeklyProfileViews} / week</TableCell>
                    <TableCell align="center" sx={{borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}><CheckCircleIcon color="success" /></TableCell>
                    <TableCell align="center"><CheckCircleIcon color="success" /></TableCell>
                </TableRow>
                <TableRow hover>
                    <TableCell>Advanced Analytics Dashboard</TableCell>
                    <TableCell align="center"><CancelIcon color="error" /></TableCell>
                    <TableCell align="center" sx={{borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}><CheckCircleIcon color="success" /></TableCell>
                    <TableCell align="center"><CheckCircleIcon color="success" /></TableCell>
                </TableRow>
                 <TableRow hover>
                    <TableCell>Group/Chain Management</TableCell>
                    <TableCell align="center"><CancelIcon color="error" /></TableCell>
                    <TableCell align="center" sx={{borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}><CancelIcon color="error" /></TableCell>
                    <TableCell align="center"><CheckCircleIcon color="success" /></TableCell>
                </TableRow>

                {/* Action Row */}
                 <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" disabled>Your Current Plan</Button>
                    </TableCell>
                    <TableCell align="center" sx={{borderLeft: 2, borderRight: 2, borderColor: 'primary.main'}}>
                        <Button variant="contained" onClick={() => handlePayment(premiumPlan!)}>Upgrade to Premium</Button>
                    </TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" onClick={() => handlePayment(enterprisePlan!)}>Contact Sales</Button>
                    </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};