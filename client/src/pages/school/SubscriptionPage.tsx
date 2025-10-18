// client/src/pages/school/SubscriptionPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';
import toast from 'react-hot-toast';
import {
  Box, Typography, CircularProgress, Alert,
  Switch, Chip, Paper, Button, List, ListItem,
  ListItemIcon, ListItemText, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { PlanDetailsModal } from '../../components/school/PlanDetailsModal';
import { useSubscription } from '../../hooks/useSubscription';

export interface IPlan {
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

const trackInterest = (planName: 'Premium' | 'Enterprise') => {
  const token = localStorage.getItem('token');
  api.post('/leads/track', { planName }, { headers: { Authorization: `Bearer ${token}` } });
};

const createOrder = async ({ planId, isAnnual }: { planId: string; isAnnual: boolean }) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/payments/create-order', { planId, isAnnual }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const verifyPayment = async (paymentData: any) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/payments/verify-payment', paymentData, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const PlanCard = ({
  plan,
  billingCycle,
  onAction,
  onLearnMore,
  isCurrent,
  isPopular,
}: {
  plan: IPlan;
  billingCycle: 'monthly' | 'annual';
  onAction: () => void;
  onLearnMore: () => void;
  isCurrent?: boolean;
  isPopular?: boolean;
}) => {
  const price = billingCycle === 'annual' ? plan.annualPrice : plan.price;

  return (
    <Paper
      elevation={isPopular ? 8 : 2}
      sx={{
        p: 3,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: isPopular ? 2 : 1,
        borderColor: isPopular ? 'primary.main' : 'grey.300',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 12 },
        height: '100%',
      }}
      onClick={onLearnMore}
    >
      {isPopular && (
        <Chip
          label="Most Popular"
          color="primary"
          sx={{ position: 'absolute', top: 16, right: 16 }}
          icon={<StarIcon />}
        />
      )}

      <Typography variant="h4" fontWeight="bold">
        {plan.name}
      </Typography>

      <Typography color="text.secondary" sx={{ minHeight: 48, mt: 1 }}>
        {plan.name === 'Basic' && 'For getting started and exploring the platform.'}
        {plan.name === 'Premium' && 'For growing schools serious about efficient hiring.'}
        {plan.name === 'Enterprise' && 'For large school groups & chains needing scale.'}
      </Typography>

      <Box sx={{ my: 2 }}>
        <Typography variant="h3" component="span" fontWeight="bold">
          ₹
          {price > 0
            ? (billingCycle === 'annual'
              ? (price / 12).toFixed(0)
              : price
            ).toLocaleString()
            : '0'}
        </Typography>
        <Typography component="span" color="text.secondary">
          /mo
        </Typography>
        {billingCycle === 'annual' && price > 0 && (
          <Typography variant="body2" color="text.secondary">
            Billed as ₹{price.toLocaleString()}/year
          </Typography>
        )}
      </Box>

      <Button
        variant={isPopular ? 'contained' : 'outlined'}
        fullWidth
        size="large"
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        disabled={isCurrent}
        sx={{ my: 2 }}
      >
        {isCurrent
          ? 'Your Current Plan'
          : plan.name === 'Enterprise'
            ? 'Contact Sales'
            : 'Upgrade to Premium'}
      </Button>

      <Divider sx={{ my: 2 }}>Key Features</Divider>

      <Box sx={{ flexGrow: 1 }}>
        <List sx={{ textAlign: 'left' }}>
          {plan.features.slice(0, 4).map((feature) => (
            <ListItem key={feature} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Typography
        color="primary"
        sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}
      >
        Click to Compare All Features
      </Typography>
    </Paper>
  );
};

export const SubscriptionPage = () => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);

  const { data: plans, isLoading: isLoadingPlans, isError: isErrorPlans } = useQuery<IPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: fetchPlans,
  });

  const { data: myPlan, isLoading: isLoadingMyPlan } = useSubscription();

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      toast.success('Subscription activated successfully!');
      queryClient.invalidateQueries({ queryKey: ['mySubscriptionPlan'] });
    },
    onError: () => toast.error('Payment verification failed.'),
  });

  const handleActionClick = (plan: IPlan) => {
    if (plan.name === 'Enterprise') {
      trackInterest('Enterprise');
      navigate('/enterprise-interest');
    } else if (plan.name === 'Premium') {
      trackInterest('Premium');
      handlePayment(plan);
    }
  };

  const handlePayment = async (plan: IPlan) => {
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
        handler: (response: any) => {
          verifyMutation.mutate({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan._id,
            isAnnual,
          });
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
          contact: userInfo?.phone,
        },
        theme: { color: '#1976d2' },
      };
      new (window as any).Razorpay(options).open();
    } catch {
      toast.error('Failed to initiate payment.');
    }
  };

  const handleLearnMoreClick = (plan: IPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  if (isLoadingPlans || isLoadingMyPlan) return <CircularProgress />;
  if (isErrorPlans) return <Alert severity="error">Could not load subscription plans.</Alert>;

  const sortedPlans = plans?.sort((a, b) => a.price - b.price);

  return (
    <>
      <Box sx={{ width: '100%', mx: 'auto', px: 2 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Find The Plan That’s Right For You
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Unlock powerful tools to find the best educators, faster.
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" mb={5}>
          <Typography>Monthly</Typography>
          <Switch
            checked={billingCycle === 'annual'}
            onChange={(e) => setBillingCycle(e.target.checked ? 'annual' : 'monthly')}
          />
          <Typography>
            Annual <Chip label="Save ~16%" color="success" size="small" />
          </Typography>
        </Box>

        {/* Equal height responsive layout */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 4,
          }}
        >
          {sortedPlans?.map((plan) => (
            <Box
              key={plan._id}
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 33%' },
                maxWidth: { md: '400px' },
                display: 'flex',
              }}
            >
              <PlanCard
                plan={plan}
                billingCycle={billingCycle}
                onAction={() => handleActionClick(plan)}
                onLearnMore={() => handleLearnMoreClick(plan)}
                isCurrent={myPlan?.name === plan.name}
                isPopular={plan.name === 'Premium'}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <PlanDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plans={sortedPlans || []}
        selectedPlan={selectedPlan}
        onUpgradeClick={handleActionClick}
      />
    </>
  );
};
