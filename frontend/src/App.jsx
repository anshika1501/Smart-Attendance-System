import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import AttendanceMonitor from './pages/AttendanceMonitor';

const RoleRedirect = () => {
  const role = localStorage.getItem('role') || 'student';
  return role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/attendance" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role') || 'student';
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleRedirect />} />
          <Route path="dashboard" element={<RoleRoute allowedRoles={['admin']}><Dashboard /></RoleRoute>} />
          <Route path="attendance" element={<RoleRoute allowedRoles={['student']}><Attendance /></RoleRoute>} />
          <Route path="attendance-monitor" element={<RoleRoute allowedRoles={['admin', 'student']}><AttendanceMonitor /></RoleRoute>} />
          <Route path="students" element={<RoleRoute allowedRoles={['admin']}><Students /></RoleRoute>} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
