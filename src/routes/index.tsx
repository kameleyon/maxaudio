import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Home } from '../pages/Home';
import { Studio } from '../pages/Studio';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/sign-in/*" 
        element={
          <SignIn 
            routing="path" 
            path="/sign-in" 
            redirectUrl="/studio"
            afterSignInUrl="/studio"
          />
        } 
      />
      <Route 
        path="/sign-up/*" 
        element={
          <SignUp 
            routing="path" 
            path="/sign-up"
            redirectUrl="/studio"
            afterSignUpUrl="/studio"
          />
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
