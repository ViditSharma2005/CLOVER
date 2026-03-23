import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!form.password) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.worker, res.data.token);
      toast.success(`Welcome back, ${res.data.worker.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-hero-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-brand-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 relative z-10">
        <div className="hidden lg:flex card flex-col justify-between">
          <div>
            <span className="section-chip mb-4">Trusted by delivery partners</span>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">Protection for high-risk shifts and uncertain days.</h2>
            <p className="text-gray-300 mt-4">When weather or city disruptions hit your route, CLOVER helps recover your weekly income faster.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['2.4L+', 'Workers Covered'], ['<2 hrs', 'Avg Payout'], ['28+', 'Cities']].map(([v, l]) => (
              <div key={l} className="soft-panel p-3 text-center">
                <p className="font-display text-xl font-bold text-brand-300">{v}</p>
                <p className="text-xs text-gray-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md lg:max-w-none mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-glow">C</div>
            <span className="font-display text-2xl font-bold text-white">CLOVER</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-300 mt-2 font-medium">Sign in and continue with your protected earnings dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
              <input type="tel" className="input-field" placeholder="9876543210"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                maxLength={10} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input-field pr-20" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white px-2 py-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-600">
            <p className="text-center text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one free</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 soft-glow-panel rounded-xl">
            <p className="text-xs text-gray-400 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-gray-300">Worker: <span className="text-brand-400">9876543210</span> / <span className="text-brand-400">Worker@123</span></p>
              <p className="text-gray-300">Admin: <span className="text-brand-400">9000000000</span> / <span className="text-brand-400">Admin@123</span></p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
