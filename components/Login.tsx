import React, { useState } from 'react';
import { Page } from '../types';
import InfoCard from './Card';

interface LoginProps {
  setPage: (page: Page) => void;
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ setPage, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    } else {
      alert('Please enter your email and password.');
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <InfoCard title="Login to Your Account">
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900 caret-black"
                style={{ color: '#0b1220', backgroundColor: '#ffffff', caretColor: '#0b1220' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-base-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900 caret-black"
                style={{ color: '#0b1220', backgroundColor: '#ffffff', caretColor: '#0b1220' }}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-focus hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-300"
          >
            Sign in
          </button>
          <p className="text-center text-sm text-gray-400">
            Not a member?{' '}
            <button onClick={() => setPage('Register')} className="font-medium text-primary hover:text-primary-focus hover:underline">
              Register now
            </button>
          </p>
        </form>
      </InfoCard>
    </div>
  );
};

export default Login;
