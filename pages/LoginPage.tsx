
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HeartIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleFillCredentials = (demoEmail: string, demoPass: string) => {
      setEmail(demoEmail);
      setPassword(demoPass);
      setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="p-10 bg-white shadow-xl rounded-2xl">
          <div>
            <HeartIcon className="mx-auto h-12 w-auto text-secondary" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
            {successMessage && !error && <p className="text-center text-green-500 bg-green-100 p-3 rounded-lg">{successMessage}</p>}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="text-sm text-center mt-6">
              <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary hover:text-primary-focus">
                      Register here
                  </Link>
              </p>
          </div>
        </div>

        <div className="mt-8">
            <h3 className="text-center text-lg font-bold text-gray-700">Demo Credentials</h3>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1 bg-white p-4 rounded-lg shadow-md text-center">
                    <ShieldCheckIcon className="w-8 h-8 mx-auto text-primary mb-2"/>
                    <h4 className="font-semibold text-gray-800">Admin Login</h4>
                    <p className="text-xs text-gray-500">Email: <span className="font-mono">nish@gmail.com</span></p>
                    <p className="text-xs text-gray-500">Pass: <span className="font-mono">123123</span></p>
                    <button onClick={() => handleFillCredentials('nish@gmail.com', '123123')} className="mt-3 w-full text-xs bg-primary/10 text-primary-focus font-semibold py-1.5 px-3 rounded-md hover:bg-primary/20">Fill Credentials</button>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-md text-center">
                    <UserCircleIcon className="w-8 h-8 mx-auto text-secondary mb-2"/>
                    <h4 className="font-semibold text-gray-800">User Login</h4>
                    <p className="text-xs text-gray-500">Email: <span className="font-mono">jane.doe@example.com</span></p>
                    <p className="text-xs text-gray-500">Pass: <span className="font-mono">password123</span></p>
                    <button onClick={() => handleFillCredentials('jane.doe@example.com', 'password123')} className="mt-3 w-full text-xs bg-secondary/10 text-pink-700 font-semibold py-1.5 px-3 rounded-md hover:bg-secondary/20">Fill Credentials</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;