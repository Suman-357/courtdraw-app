import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SessionSetup from './pages/SessionSetup';
import ActiveSession from './pages/ActiveSession';
import SessionSummary from './pages/SessionSummary';
import MemberDashboard from './pages/MemberDashboard';
import GroupSettings from './pages/GroupSettings';
import SessionHistory from './pages/SessionHistory';
import FineLedger from './pages/FineLedger';

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<DashboardLayout allowedRoles={['superadmin']} />}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        </Route>

        <Route element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/session/new" element={<SessionSetup />} />
          <Route path="/admin/session/:id" element={<ActiveSession />} />
          <Route path="/admin/session/:id/summary" element={<SessionSummary />} />
          <Route path="/admin/sessions" element={<SessionHistory />} />
          <Route path="/admin/fines" element={<FineLedger />} />
          <Route path="/admin/settings" element={<GroupSettings />} />
        </Route>

        <Route element={<DashboardLayout allowedRoles={['member']} />}>
          <Route path="/member/dashboard" element={<MemberDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
