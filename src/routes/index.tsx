import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Studio } from '../pages/Studio';
import { SignUp } from '../pages/SignUp';
import { NewUserRedirect } from '../components/auth/NewUserRedirect';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route 
        path="/welcome" 
        element={
          <ProtectedRoute>
            <NewUserRedirect />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/studio" 
        element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
