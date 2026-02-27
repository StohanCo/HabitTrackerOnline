import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Github } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { user, loading, cloudEnabled, signUp, signIn, signInWithProvider } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  // Already logged in → go to dashboard
  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'register' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    const err =
      mode === 'register'
        ? await signUp(email, password)
        : await signIn(email, password);
    setBusy(false);

    if (err) {
      setError(err);
    } else if (mode === 'register') {
      setInfo(
        'Check your email for a confirmation link, then come back and sign in!'
      );
    }
  };

  const handleSSO = async (provider: 'google' | 'github') => {
    setError('');
    const err = await signInWithProvider(provider);
    if (err) setError(err);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-400 tracking-tight">
            HabitTracker
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to your account'
              : 'Create a new account'}
          </p>
        </div>

        {!cloudEnabled && (
          <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-lg px-4 py-3 mb-6 text-sm text-yellow-300">
            Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> in{' '}
            <span className="font-mono">.env.local</span> to enable auth &
            cloud sync.
          </div>
        )}

        {/* SSO buttons */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSSO('google')}
            disabled={!cloudEnabled}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.07 24.07 0 000 21.56l7.98-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSSO('github')}
            disabled={!cloudEnabled}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Github size={16} />
            GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs text-gray-500 uppercase">
            or use email
          </span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {mode === 'register' && (
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700/40 rounded-lg px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-green-900/30 border border-green-700/40 rounded-lg px-4 py-2 text-sm text-green-300">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !cloudEnabled}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <LogIn size={16} />
            {busy ? 'Working…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <span className="text-gray-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                  setInfo('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setInfo('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
