// src/pages/auth/RegistrationChoicePage.tsx

import { Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';

export const RegistrationChoicePage = () => {
    return (
        <Container component="main" maxWidth="sm">
            <Paper sx={{ mt: 8, p: 4, textAlign: 'center' }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    Join Our Platform
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Please select your role to get started.
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <Box
                            component={RouterLink}
                            to="/register/candidate"
                            sx={{
                                display: 'block',
                                p: 4,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                textDecoration: 'none',
                                color: 'inherit',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: 2,
                                },
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 60 }} color="primary" />
                            <Typography variant="h6" mt={1}>
                                I am a Candidate
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Looking for my next teaching opportunity.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box
                           component={RouterLink}
                           to="/register/school"
                           sx={{
                                display: 'block',
                                p: 4,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                textDecoration: 'none',
                                color: 'inherit',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: 2,
                                },
                           }}
                        >
                            <SchoolIcon sx={{ fontSize: 60 }} color="primary" />
                            <Typography variant="h6" mt={1}>
                                I am a School
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Looking to hire talented educators.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};