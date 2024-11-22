import React from 'react';
import { Navigate } from 'react-router-dom';
import { SignUpForm } from '../components/auth/SignUpForm';
import authService from '../services/auth.service';

export function SignUp() {
  const isAuthenticated = authService.isAuthenticated();

  React.useEffect(() => {
    // Clear any old auth data when visiting signup page
    if (!isAuthenticated) {
      authService.logout();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return <Navigate to="/welcome" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-16rem)] gap-8 md:gap-12 items-center px-4 md:px-6">
      {/* Hero Section */}
      <div className="flex-1 text-center md:text-left">
        <img 
          src="/audiomax.png" 
          alt="AudioMax Logo" 
          className="w-[400px] md:w-[400px] mx-auto md:mx-0 mb-8"
        />
        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text animate-gradient">
          Join AUDIOMAX Today
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto md:mx-0">
          Create stunning audio content with AI-powered voice technology. Perfect for content creators, educators, and storytellers.
        </p>
      </div>

      {/* Auth Section */}
      <div className="w-full md:flex-1 md:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-8 border border-white/10" style={{ boxShadow: '0 4px 12px #00000030' }}>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
