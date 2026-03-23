import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsAPI } from '../services/api';
import { useAuthStore } from '../store';
import { FiAward, FiFileText, FiGift, FiInfo, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

const COLORS = ['#1d8fff', '#0ea5e9', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#f87171'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `₹${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { worker } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(3);

  const exportEarningsCsv = () => {
    const rows = [['week', 'protected_amount', 'claims_count']];
    earningsChartData.forEach((row) => rows.push([row.name, row.protected, row.claims]));
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `clover-analytics-${period}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, earnRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          analyticsAPI.getEarnings(period)
        ]);
        setDashboard(dashRes.data.dashboard);
        setEarnings(earnRes.data.data || []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [period]);

  const earningsChartData = earnings.map(e => ({
    name: `W${e._id.week}`,
    protected: e.totalProtected,
    claims: e.claimsCount
  }));

  const claimStats = dashboard?.claimStats || {};
  const pieData = Object.entries(claimStats).map(([status, data]) => ({
    name: status.replace(/_/g, ' '),
    value: data.count || 0
  })).filter(d => d.value > 0);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-48 skeleton" />)}</div>;

  return (
    <div className="page-container animate-slide-in">
      <div className="section-head">
        <div>
          <span className="section-chip mb-3">Performance Intelligence</span>
          <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Your income protection performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-300 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2">
            Updated for last {period} month{period > 1 ? 's' : ''}
          </div>
          <button onClick={exportEarningsCsv} className="btn-secondary text-xs py-2 px-3">Export CSV</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Protected', value: `₹${(dashboard?.totalPaid || 0).toLocaleString()}`, Icon: FiZap, color: 'text-cyan-300' },
          { label: 'Total Claims', value: dashboard?.totalClaims || 0, Icon: FiFileText, color: 'text-blue-300' },
          { label: 'Approval Rate', value: `${dashboard?.approvalRate || 0}%`, Icon: FiTrendingUp, color: 'text-brand-300' },
          { label: 'Loyalty Points', value: worker?.loyaltyPoints || 0, Icon: FiAward, color: 'text-amber-300' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="card text-center">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 text-brand-300 mx-auto mb-2 flex items-center justify-center">
              <Icon className="text-lg" />
            </div>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Earnings Protected Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-white">Income Protected Over Time</h2>
          <select className="input-field w-auto min-w-[140px] text-sm" value={period} onChange={e => setPeriod(parseInt(e.target.value))}>
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
          </select>
        </div>
        {earningsChartData.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No protection payouts in this period yet.
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={earningsChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d45" />
            <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="protected" name="Amount Protected (₹)" fill="#1d8fff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
        <p className="text-xs text-gray-500 mt-3">Tip: Use this chart to monitor disruption-heavy weeks and plan buffer savings accordingly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Status Pie */}
        <div className="card">
          <h2 className="font-display text-lg font-bold text-white mb-4">Claims by Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">No claims data yet</div>
          )}
        </div>

        {/* Risk Score Gauge + Info */}
        <div className="card">
          <h2 className="font-display text-lg font-bold text-white mb-4">Risk Profile Analysis</h2>
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a26" strokeWidth="14" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={worker?.riskCategory === 'low' ? '#1d8fff' : worker?.riskCategory === 'high' ? '#ef4444' : '#f59e0b'}
                  strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${(worker?.riskScore || 0.5) * 314} 314`}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold text-white">{Math.round((worker?.riskScore || 0.5) * 100)}</span>
                <span className={`text-sm font-semibold capitalize ${worker?.riskCategory === 'low' ? 'text-brand-300' : worker?.riskCategory === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>{worker?.riskCategory} risk</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(worker?.riskFactors || []).map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 capitalize">{f.factor?.replace(/_/g, ' ')}</span>
                    <span className={f.weight > 0 ? 'text-red-400' : 'text-cyan-300'}>{f.weight > 0 ? '+' : ''}{(f.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${f.weight > 0.05 ? 'bg-red-500' : f.weight < -0.02 ? 'bg-cyan-400' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(Math.abs(f.weight) * 300, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-dark-700 rounded-xl text-xs text-gray-400">
            <span className="inline-flex items-center gap-2"><FiInfo /> Lower your risk score by maintaining a clean claim history and staying active on the platform.</span>
          </div>
        </div>
      </div>

      {/* Weekly Streak */}
      <div className="card">
        <h2 className="font-display text-lg font-bold text-white mb-4">Weekly Streak & Loyalty</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/[0.04] border border-white/10 rounded-xl">
            <div className="font-display text-3xl font-bold text-brand-400">{worker?.streakWeeks || 0}</div>
            <p className="text-gray-400 text-xs mt-1 inline-flex items-center gap-1"><FiTrendingUp className="text-[11px]" /> Week Streak</p>
          </div>
          <div className="text-center p-4 bg-white/[0.04] border border-white/10 rounded-xl">
            <div className="font-display text-3xl font-bold text-yellow-400">{worker?.loyaltyPoints || 0}</div>
            <p className="text-gray-400 text-xs mt-1 inline-flex items-center gap-1"><FiAward className="text-[11px]" /> Loyalty Points</p>
          </div>
          <div className="text-center p-4 bg-white/[0.04] border border-white/10 rounded-xl">
            <div className="font-display text-3xl font-bold text-cyan-300">{worker?.referralCount || 0}</div>
            <p className="text-gray-400 text-xs mt-1 inline-flex items-center gap-1"><FiGift className="text-[11px]" /> Friends Referred</p>
          </div>
          <div className="text-center p-4 bg-white/[0.04] border border-white/10 rounded-xl">
            <div className="font-display text-3xl font-bold text-blue-400">{worker?.totalClaimsCount || 0}</div>
            <p className="text-gray-400 text-xs mt-1 inline-flex items-center gap-1"><FiShield className="text-[11px]" /> Claims Received</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-xs text-brand-300">
          You earn 25 points every week you renew and 50 points per new policy. 10 points per claim received. Redeem points for premium discounts.
        </div>
      </div>
    </div>
  );
}
