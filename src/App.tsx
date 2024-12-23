import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { SignUp } from './pages/SignUp';
import { Studio } from './pages/Studio';
import { FileManagement } from './pages/FileManagement';
import { VoiceCloning } from './pages/VoiceCloning';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { Notifications } from './pages/Notifications';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';
import { NotificationHistory } from './pages/NotificationHistory';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { NewUserRedirect } from './components/auth/NewUserRedirect';
import { NotificationManager } from './components/notifications/NotificationManager';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ToastProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/new-user-redirect" element={<NewUserRedirect />} />
                <Route path="sign-up" element={<SignUp />} />
                <Route path="studio" element={
                  <ProtectedRoute>
                    <Studio />
                  </ProtectedRoute>
                } />
                <Route path="files" element={
                  <ProtectedRoute>
                    <FileManagement />
                  </ProtectedRoute>
                } />
                <Route path="voice-cloning" element={
                  <ProtectedRoute>
                    <VoiceCloning />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="help" element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                } />
                <Route path="notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="notification-history" element={
                  <ProtectedRoute>
                    <NotificationHistory />
                  </ProtectedRoute>
                } />
                <Route path="about" element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } />
                <Route path="admin/*" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            
            {/* Subscription & Usage Notifications */}
            <NotificationManager />
          </NotificationProvider>
        </ToastProvider>
      </UserProvider>
    </AuthProvider>
  );
}
