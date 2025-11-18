import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

// Main pages
import Dashboard from './components/dashboard/Dashboard';
import StressPage from './components/stress/StressPage';
import DietPage from './components/diet/DietPage';

// Lazy-loaded pages to reduce initial bundle size
const ActivityPage = React.lazy(() => import('./pages/ActivityPage'));
const SleepPage = React.lazy(() => import('./pages/SleepPage'));
const HeartPage = React.lazy(() => import('./pages/HeartPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Loading fallback for lazy-loaded components
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="stress" element={<StressPage />} />
            <Route path="diet" element={<DietPage />} />
            
            {/* Lazy-loaded routes */}
            <Route path="activity" element={
              <React.Suspense fallback={<PageLoader />}>
                <ActivityPage />
              </React.Suspense>
            } />
            <Route path="sleep" element={
              <React.Suspense fallback={<PageLoader />}>
                <SleepPage />
              </React.Suspense>
            } />
            <Route path="heart" element={
              <React.Suspense fallback={<PageLoader />}>
                <HeartPage />
              </React.Suspense>
            } />
            <Route path="analytics" element={
              <React.Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </React.Suspense>
            } />
            <Route path="notifications" element={
              <React.Suspense fallback={<PageLoader />}>
                <NotificationsPage />
              </React.Suspense>
            } />
            <Route path="profile" element={
              <React.Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </React.Suspense>
            } />
            <Route path="settings" element={
              <React.Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </React.Suspense>
            } />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;