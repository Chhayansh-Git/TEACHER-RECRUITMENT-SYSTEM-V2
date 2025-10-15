// src/pages/auth/RegistrationPaymentPage.tsx

import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// MUI Components
import { Container, Paper, Typography, Button, Box, CircularProgress, Alert, Link } from '@mui/material';

const createRegistrationOrder = async (userId: string) => {
    const { data } = await api.post('/payments/create-registration-order', { userId });
    return data;
};

const verifyRegistrationPayment = async (paymentData: any) => {
    const { data } = await api.post('/payments/verify-registration-payment', paymentData);
    return data;
};

export const RegistrationPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, userId, schoolName } = location.state || {};

    // Redirect if required state is missing
    useEffect(() => {
        if (!userId || !email) {
            toast.error("Invalid session. Please register again.");
            navigate('/register', { replace: true });
        }
    }, [userId, email, navigate]);


    const verifyMutation = useMutation({
        mutationFn: verifyRegistrationPayment,
        onSuccess: (data) => {
            toast.success(data.message + " Please log in to continue.");
            // On successful payment, send the user to the login page.
            navigate('/login');
        },
        onError: () => {
            toast.error('Payment verification failed. Please contact support.');
        }
    });

    const handlePayment = async () => {
        if (!userId) return; // Guard clause
        try {
            const order = await createRegistrationOrder(userId);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Teacher Recruitment System',
                description: 'One-Time School Registration Fee',
                order_id: order.id,
                handler: function (response: any) {
                    verifyMutation.mutate({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        userId: userId,
                    });
                },
                prefill: {
                    name: schoolName,
                    email: email,
                },
                theme: {
                    color: '#1976d2',
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment initiation failed', error);
            toast.error('Could not initiate payment. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    Final Step: Complete Your Registration
                </Typography>
                <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                    Your email has been verified. To activate your school's account, please complete the one-time registration fee.
                </Typography>

                {verifyMutation.isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handlePayment}
                        disabled={verifyMutation.isPending}
                    >
                        Proceed to Payment
                    </Button>
                )}
                 {verifyMutation.isError && (
                    <Alert severity="error" sx={{mt: 2, width: '100%'}}>Payment failed. Please try again or <Link component={RouterLink} to="/contact-support">contact support</Link>.</Alert>
                 )}
            </Paper>
        </Container>
    );
};