import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import './index.css';
import App from './App.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import AuthContextProvider, { useAuth } from './context/AuthContext.jsx';
import { Toaster } from './components/ui/toast.jsx';

// Refactored Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import IdentityProfilePage from './pages/auth/IdentityProfilePage.jsx';
import PlanJourneyPage from './pages/trips/PlanJourneyPage.jsx';
import DashboardPage from './pages/trips/DashboardPage.jsx';
import ItineraryViewPage from './pages/trips/ItineraryViewPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import CommunicationHub from './pages/chat/CommunicationHub.jsx';
import AdminProtocolPage from './pages/AdminProtocolPage.jsx';
import OrganiserControlPage from './pages/OrganiserControlPage.jsx';

/**
 * Access Control Layer
 * Ensures identity and session context is verified.
 */
const SecurityRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (role && user.role !== role && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <App />
      },
      {
        path: 'explore',
        element: <ExplorePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'profile',
        element: <SecurityRoute><IdentityProfilePage /></SecurityRoute>
      },
      {
        path: 'create-trip',
        element: <SecurityRoute><PlanJourneyPage /></SecurityRoute>
      },
      {
        path: 'my-trips',
        element: <SecurityRoute><DashboardPage /></SecurityRoute>
      },
      {
        path: 'view-trip/:id',
        element: <ItineraryViewPage />
      },
      {
        path: 'chat',
        element: <SecurityRoute><CommunicationHub /></SecurityRoute>
      },
      {
        path: 'admin',
        element: <SecurityRoute role="admin"><AdminProtocolPage /></SecurityRoute>
      },
      {
        path: 'organiser',
        element: <SecurityRoute role="organiser"><OrganiserControlPage /></SecurityRoute>
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <Toaster />
      <RouterProvider router={router} />
    </AuthContextProvider>
  </React.StrictMode>
);
