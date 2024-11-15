import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '../components/layout/Layout';
import { Home } from '../pages/Home';
import { Studio } from '../pages/Studio';
import { SignUp } from '../pages/SignUp';
import { NewUserRedirect } from '../components/auth/NewUserRedirect';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
      </Route>
    </Routes>
  );
}

// Verification page component
function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to studio after 3 seconds
        setTimeout(() => {
          navigate('/studio');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/10 max-w-md w-full">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
              <p className="text-white/80">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-white/80">{message}</p>
              <p className="text-white/60 mt-4">Redirecting to studio...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-white/80">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg text-white transition-colors"
              >
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Password reset page component
function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password
      });
      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/10 max-w-md w-full">
        {status === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>
            
            {message && (
              <div className="text-red-400 text-sm mb-4">{message}</div>
            )}

            <div>
              <label className="block text-white/80 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-white/80 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg text-white transition-colors"
            >
              Reset Password
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-white/80">{message}</p>
            <p className="text-white/60 mt-4">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Failed</h2>
            <p className="text-white/80">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
