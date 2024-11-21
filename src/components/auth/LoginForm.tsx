import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/studio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-white text-xl md:text-2xl font-semibold">Sign in to AudioMax</h2>
        <p className="text-white/80 mt-2">Enter your details to continue</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-primary text-sm">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-white/10 border border-white/20 text-white w-full px-3 py-2 rounded-md focus:outline-none focus:border-primary"
            placeholder="Enter your email"
          />
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
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-white/80">
              Remember me
            </label>
          </div>
          <a 
            href="/forgot-password" 
            className="text-sm text-[#9de9c7] hover:text-[#9de9c7]/80"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#63248d] hover:bg-[#63248d]/80 w-full py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center justify-center mt-4 text-sm">
        <span className="text-white/60">Don't have an account?</span>
        <a 
          href="/sign-up" 
          className="text-[#9de9c7] hover:text-[#9de9c7]/80 ml-2"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
