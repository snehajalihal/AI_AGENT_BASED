import React, { useState } from 'react';
import { Page } from '../types';
import InfoCard from './Card';

interface RegisterProps {
  setPage: (page: Page) => void;
  onRegister: () => void;
}

const Register: React.FC<RegisterProps> = ({ setPage, onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && email && password) {
      onRegister();
    } else {
      alert('Please fill out all fields.');
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <InfoCard title="Create an Account">
        <form onSubmit={handleRegister} className="space-y-8">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-base-100"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email-register"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-base-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password-register"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-base-100"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-focus hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-300"
          >
            Create Account
          </button>
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button onClick={() => setPage('Login')} className="font-medium text-primary hover:text-primary-focus hover:underline">
              Sign in
            </button>
          </p>
        </form>
      </InfoCard>
    </div>
  );
};

export default Register;
