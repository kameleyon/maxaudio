import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import debounce from 'lodash/debounce';

type ValidationStatus = 'none' | 'checking' | 'valid' | 'invalid';

interface ValidationState {
  username: ValidationStatus;
  email: ValidationStatus;
}

export function SignUpForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [validation, setValidation] = useState<ValidationState>({
    username: 'none',
    email: 'none'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // Debounced validation functions
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) return;
      setValidation(prev => ({ ...prev, username: 'checking' }));
      const available = await authService.checkUsernameAvailability(username);
      setValidation(prev => ({ ...prev, username: available ? 'valid' : 'invalid' }));
    }, 500),
    []
  );

  const checkEmail = useCallback(
    debounce(async (email: string) => {
      if (!email.includes('@')) return;
      setValidation(prev => ({ ...prev, email: 'checking' }));
      const available = await authService.checkEmailAvailability(email);
      setValidation(prev => ({ ...prev, email: available ? 'valid' : 'invalid' }));
    }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'username') {
      setValidation(prev => ({ ...prev, username: 'checking' }));
      checkUsername(value);
    } else if (name === 'email') {
      setValidation(prev => ({ ...prev, email: 'checking' }));
      checkEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length and complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long, with at least 1 capital letter, 1 number, and 1 symbol');
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if username and email are valid
    if (validation.username !== 'valid' || validation.email !== 'valid') {
      setError('Please ensure username and email are valid');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate('/new-user-redirect');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ status }: { status: ValidationStatus }) => {
    if (status === 'none' || status === 'checking') return null;
    return status === 'valid' ? (
      <CheckCircleIcon className="w-5 h-5 text-green-500" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-white text-xl md:text-2xl font-semibold">Create your account</h2>
        <p className="text-white/80 mt-2">Join AUDIOMAX to start creating</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-primary text-sm">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="bg-white/10 border border-white/20 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:border-primary pr-10"
              placeholder="Choose a username"
              pattern="^[a-zA-Z0-9_]+$"
              title="Username can only contain letters, numbers, and underscores"
              minLength={3}
              maxLength={30}
            />
            <div className="absolute right-3 top-2.5">
              {validation.username === 'checking' ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ValidationIcon status={validation.username} />
              )}
            </div>
          </div>
          <p className="text-white/60 text-xs">3-30 characters, letters, numbers, and underscores only</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-primary text-sm">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="bg-white/10 border border-white/20 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:border-primary"
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-primary text-sm">
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white/10 border border-white/20 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:border-primary pr-10"
              placeholder="Enter your email"
            />
            <div className="absolute right-3 top-2.5">
              {validation.email === 'checking' ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ValidationIcon status={validation.email} />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-primary text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-white/10 border border-white/20 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:border-primary"
            placeholder="Create a password"
            minLength={8}
          />
          <p className="text-white/60 text-xs">Must be at least 8 characters</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-primary text-sm">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="bg-white/10 border border-white/20 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:border-primary"
            placeholder="Confirm your password"
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || validation.username !== 'valid' || validation.email !== 'valid'}
          className="bg-[#63248d] hover:bg-[#63248d]/80 w-full py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
