// src/App.tsx

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegistrationChoicePage } from './pages/auth/RegistrationChoicePage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import { SchoolRegistrationPage } from './pages/auth/SchoolRegistrationPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { RegistrationPaymentPage } from './pages/auth/RegistrationPaymentPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Layouts and Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboard Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { SchoolDashboardPage } from './pages/school/SchoolDashboardPage';
import { CandidateDashboardPage } from './pages/candidate/CandidateDashboardPage';

// Candidate Pages
import { CompleteProfilePage } from './pages/candidate/CompleteProfilePage';
import { EditProfilePage } from './pages/candidate/EditProfilePage';
import { ViewProfilePage } from './pages/candidate/ViewProfilePage';
import { ViewJobsPage } from './pages/candidate/ViewJobsPage';
import { MyInterviewsPage } from './pages/candidate/MyInterviewsPage';
import { MyApplicationsPage } from './pages/candidate/MyApplicationsPage';
import { MyOffersPage } from './pages/candidate/MyOffersPage'; // Import the new page

// School Pages
import { PostRequirementPage } from './pages/school/PostRequirementPage';
import { ViewRequirementsPage } from './pages/school/ViewRequirementsPage';
import { EditRequirementPage } from './pages/school/EditRequirementPage';
import { PushedCandidatesPage } from './pages/school/PushedCandidatesPage';
import { SchoolProfilePage } from './pages/school/SchoolProfilePage';
import { ViewSchoolProfilePage } from './pages/school/ViewSchoolProfilePage';
import { SubscriptionPage } from './pages/school/SubscriptionPage';
import { EnterpriseInterestPage } from './pages/school/EnterpriseInterestPage';
import { AcceptInvitationPage } from './pages/school/AcceptInvitationPage';

// Group-Admin
import { GroupRegistrationPage } from './pages/school/GroupRegistrationPage';
import { GroupAdminDashboardPage } from './pages/group-admin/GroupAdminDashboard';
import { ManageSchoolsPage } from './pages/group-admin/ManageSchoolsPage'; // Import the new page
import { GroupAnalyticsPage } from './pages/group-admin/GroupAnalyticsPage';


// Admin Pages
import { ManageCandidatesPage } from './pages/admin/ManageCandidatesPage';
import { ManageRequirementsPage } from './pages/admin/ManageRequirementsPage';
import { PushCandidatePage } from './pages/admin/PushCandidatePage';
import { PipelinePage } from './pages/admin/PipelinePage';
import { ManageEmailTemplatesPage } from './pages/admin/ManageEmailTemplatesPage';
import { EmailTemplateFormPage } from './pages/admin/EmailTemplateFormPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ReportsPage } from './pages/admin/ReportsPage';

const queryClient = new QueryClient();

const theme = createTheme({
    // your theme settings
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster 
          position="top-right"
          toastOptions={{
            success: { style: { background: '#d4edda', color: '#155724' } },
            error: { style: { background: '#f8d7da', color: '#721c24' } },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationChoicePage />} />
          <Route path="/register/candidate" element={<RegistrationPage />} />
          <Route path="/register/school" element={<SchoolRegistrationPage />} />
          <Route path="/register/group" element={<GroupRegistrationPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/school-registration-payment" element={<RegistrationPaymentPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}> 
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Group Admin Routes */}
              <Route path="/group-admin/dashboard" element={<GroupAdminDashboardPage />} />
              <Route path="/group-admin/manage-schools" element={<ManageSchoolsPage />} />
              <Route path="/group-admin/analytics" element={<GroupAnalyticsPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/school/dashboard" element={<SchoolDashboardPage />} />
              <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />

              {/* Candidate Routes */}
              <Route path="/candidate/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/candidate/profile/edit" element={<EditProfilePage />} />
              <Route path="/candidate/profile" element={<ViewProfilePage />} />
              <Route path="/candidate/jobs" element={<ViewJobsPage />} />
              <Route path="/candidate/my-interviews" element={<MyInterviewsPage />} />
              <Route path="/candidate/my-applications" element={<MyApplicationsPage />} />
              <Route path="/candidate/my-offers" element={<MyOffersPage />} /> {/* Add this route */}

              {/* School Routes */}
              <Route path="/school/profile/edit" element={<SchoolProfilePage />} />
              <Route path="/school/profile" element={<ViewSchoolProfilePage />} />
              <Route path="/school/requirements/new" element={<PostRequirementPage />} />
              <Route path="/school/requirements/edit/:requirementId" element={<EditRequirementPage />} />
              <Route path="/school/requirements" element={<ViewRequirementsPage />} />
              <Route path="/school/pushed-candidates" element={<PushedCandidatesPage />} />
              <Route path="/school/subscription" element={<SubscriptionPage />} />
              <Route path="/enterprise-interest" element={<EnterpriseInterestPage />} />
              <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

              {/* Admin Routes */}
              <Route path="/admin/candidates" element={<ManageCandidatesPage />} />
              <Route path="/admin/requirements" element={<ManageRequirementsPage />} />
              <Route path="/admin/requirements/:requirementId/push" element={<PushCandidatePage />} />
              <Route path="/admin/pipeline" element={<PipelinePage />} />
              <Route path="/admin/email-templates" element={<ManageEmailTemplatesPage />} />
              <Route path="/admin/email-templates/new" element={<EmailTemplateFormPage />} />
              <Route path="/admin/email-templates/edit/:id" element={<EmailTemplateFormPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />

            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;