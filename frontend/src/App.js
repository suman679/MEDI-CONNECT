import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DashboardLayout from './components/common/DashboardLayout';

// Patient
import PatientDashboard  from './pages/patient/Dashboard';
import FindDoctors       from './pages/patient/FindDoctors';
import PatientAppts      from './pages/patient/Appointments';
import MedicalRecords    from './pages/patient/MedicalRecords';
import Prescriptions     from './pages/patient/Prescriptions';
import VideoConsult      from './pages/patient/VideoConsult';

// Doctor
import DoctorDashboard   from './pages/doctor/Dashboard';
import DoctorAppts       from './pages/doctor/Appointments';
import DoctorPatients    from './pages/doctor/Patients';
import DoctorProfile     from './pages/doctor/Profile';
import WritePrescription from './pages/doctor/WritePrescription';

// Admin
import AdminDashboard    from './pages/admin/Dashboard';
import ManageDoctors     from './pages/admin/ManageDoctors';
import ManageUsers       from './pages/admin/ManageUsers';

// Shared
import NotificationsPage from './pages/NotificationsPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTopColor:'var(--teal)', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
        <div style={{ fontSize:13, color:'var(--text-mid)' }}>Loading MediConnect…</div>
      </div>
    </div>
  );
  if (!user)                          return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>;
  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)              return <Navigate to="/login" replace/>;
  if (user.role==='doctor') return <Navigate to="/doctor/dashboard" replace/>;
  if (user.role==='admin')  return <Navigate to="/admin/dashboard" replace/>;
  return <Navigate to="/patient/dashboard" replace/>;
};

const App = () => (
  <AuthProvider>
    <SocketProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration:3500, style:{ fontFamily:'DM Sans, sans-serif', fontSize:14, borderRadius:10, boxShadow:'0 4px 20px rgba(14,35,64,.12)' } }}/>
        <Routes>
          <Route path="/login"    element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/"         element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<DashboardRedirect/>}/>

          {/* Patient */}
          <Route path="/patient" element={<ProtectedRoute roles={['patient']}><DashboardLayout/></ProtectedRoute>}>
            <Route path="dashboard"     element={<PatientDashboard/>}/>
            <Route path="find-doctors"  element={<FindDoctors/>}/>
            <Route path="appointments"  element={<PatientAppts/>}/>
            <Route path="records"       element={<MedicalRecords/>}/>
            <Route path="prescriptions" element={<Prescriptions/>}/>
            <Route path="video/:roomId" element={<VideoConsult/>}/>
            <Route path="notifications" element={<NotificationsPage/>}/>
          </Route>

          {/* Doctor */}
          <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DashboardLayout/></ProtectedRoute>}>
            <Route path="dashboard"          element={<DoctorDashboard/>}/>
            <Route path="appointments"       element={<DoctorAppts/>}/>
            <Route path="patients"           element={<DoctorPatients/>}/>
            <Route path="profile"            element={<DoctorProfile/>}/>
            <Route path="prescribe/:apptId"  element={<WritePrescription/>}/>
            <Route path="video/:roomId"      element={<VideoConsult/>}/>
            <Route path="notifications"      element={<NotificationsPage/>}/>
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout/></ProtectedRoute>}>
            <Route path="dashboard"     element={<AdminDashboard/>}/>
            <Route path="doctors"       element={<ManageDoctors/>}/>
            <Route path="users"         element={<ManageUsers/>}/>
            <Route path="notifications" element={<NotificationsPage/>}/>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </AuthProvider>
);

export default App;
