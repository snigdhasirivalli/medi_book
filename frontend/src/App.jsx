import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FindDoctors from './pages/FindDoctors';
import DoctorProfile from './pages/DoctorProfile';
import MyAppointments from './pages/MyAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div>{children}</div>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141c2e',
              color: '#e2e8f0',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#141c2e' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#141c2e' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['patient']}>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/find-doctors" element={
            <PrivateRoute roles={['patient', 'admin']}>
              <AppLayout><FindDoctors /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/doctors/:id" element={
            <PrivateRoute roles={['patient', 'admin']}>
              <AppLayout><DoctorProfile /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/my-appointments" element={
            <PrivateRoute roles={['patient']}>
              <AppLayout><MyAppointments /></AppLayout>
            </PrivateRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor-dashboard" element={
            <PrivateRoute roles={['doctor', 'admin']}>
              <AppLayout><DoctorDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/doctor-appointments" element={
            <PrivateRoute roles={['doctor', 'admin']}>
              <AppLayout><DoctorDashboard /></AppLayout>
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/doctors" element={
            <PrivateRoute roles={['admin']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/appointments" element={
            <PrivateRoute roles={['admin']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />

          {/* Profile (all roles) */}
          <Route path="/profile" element={
            <PrivateRoute>
              <AppLayout><Profile /></AppLayout>
            </PrivateRoute>
          } />

          {/* Root */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
