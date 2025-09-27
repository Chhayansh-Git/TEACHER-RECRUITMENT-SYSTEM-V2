// src/components/common/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.hooks';

const ProtectedRoute = () => {
  // Check for the auth token in our Redux state
  const { token } = useAppSelector((state) => state.auth);

  // If the token exists, render the child routes using <Outlet />
  // Otherwise, redirect the user to the /login page
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;