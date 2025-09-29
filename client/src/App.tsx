// src/App.tsx

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

// Import Pages and Components
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CompleteProfilePage } from './pages/candidate/CompleteProfilePage'; // Import new page
import { PostRequirementPage } from './pages/school/PostRequirementPage'; // Import
import { ViewRequirementsPage } from './pages/school/ViewRequirementsPage';
import { ViewJobsPage } from './pages/candidate/ViewJobsPage';
import { ManageCandidatesPage } from './pages/admin/ManageCandidatesPage';
import { ManageRequirementsPage } from './pages/admin/ManageRequirementsPage';
import { PushCandidatePage } from './pages/admin/PushCandidatePage';
import { PushedCandidatesPage } from './pages/school/PushedCandidatesPage';
import { MyInterviewsPage } from './pages/candidate/MyInterviewsPage';
import { PipelinePage } from './pages/admin/PipelinePage';
import { EditProfilePage } from './pages/candidate/EditProfilePage';
import { SchoolProfilePage } from './pages/school/SchoolProfilePage';
import { SubscriptionPage } from './pages/school/SubscriptionPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { SchoolDashboardPage } from './pages/school/SchoolDashboardPage';
import { CandidateDashboardPage } from './pages/candidate/CandidateDashboardPage';
import { ViewProfilePage } from './pages/candidate/ViewProfilePage';
import { ViewSchoolProfilePage } from './pages/school/ViewSchoolProfilePage';
import { OtpVerificationPage } from './pages/auth/OtpVerificationPage';
import { ManageEmailTemplatesPage } from './pages/admin/ManageEmailTemplatesPage';
import { EmailTemplateFormPage } from './pages/admin/EmailTemplateFormPage'; 
import { SettingsPage } from './pages/admin/SettingsPage'; 
import { ReportsPage } from './pages/admin/ReportsPage';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#d32f2f',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#d4edda',
                color: '#155724',
              },
            },
            error: {
              style: {
                background: '#f8d7da',
                color: '#721c24',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/verify-email" element={<OtpVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/candidate/complete-profile" element={<CompleteProfilePage />} /> {/* Add new route */}
              <Route path="/school/requirements/new" element={<PostRequirementPage />} /> {/* Add new route */}
              <Route path="/school/requirements" element={<ViewRequirementsPage />} />
              <Route path="/candidate/jobs" element={<ViewJobsPage />} />
              <Route path="/admin/candidates" element={<ManageCandidatesPage />} />
              <Route path="/admin/requirements" element={<ManageRequirementsPage />} />
              <Route path="/admin/requirements/:requirementId/push" element={<PushCandidatePage />} />
              <Route path="/admin/email-templates" element={<ManageEmailTemplatesPage />} />
              <Route path="/admin/email-templates/new" element={<EmailTemplateFormPage />} />
              <Route path="/admin/email-templates/edit/:id" element={<EmailTemplateFormPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/school/pushed-candidates" element={<PushedCandidatesPage />} />
              <Route path="/candidate/my-interviews" element={<MyInterviewsPage />} />
              <Route path="/admin/pipeline" element={<PipelinePage />} />
              <Route path="/candidate/profile/edit" element={<EditProfilePage />} />
              <Route path="/school/profile/edit" element={<SchoolProfilePage />} /> 
              <Route path="/school/subscription" element={<SubscriptionPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/school/dashboard" element={<SchoolDashboardPage />} />
              <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
              <Route path="/candidate/profile" element={<ViewProfilePage />} />
              <Route path="/school/profile" element={<ViewSchoolProfilePage />} />
            </Route>
          </Route>
          
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

