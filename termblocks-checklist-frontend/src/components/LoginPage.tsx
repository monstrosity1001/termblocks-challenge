import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';

import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) return;
    setLoading(true);
    try {
      await login(username);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border px-3 py-2 rounded outline-blue-400"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold mt-2"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="text-red-600 text-center text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
