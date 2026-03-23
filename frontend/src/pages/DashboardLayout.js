import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store';
import { notificationAPI } from '../services/api';
import {
  FiGrid,
  FiShield,
  FiFileText,
  FiBarChart2,
  FiCloud,
  FiBell,
  FiCreditCard,
  FiGift,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlusCircle,
  FiStar,
  FiX,
} from 'react-icons/fi';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your protection and activity' },
  '/dashboard/policy': { title: 'Policy', subtitle: 'Manage plans, renewals, and coverage' },
  '/dashboard/claims': { title: 'Claims', subtitle: 'Track and submit claim requests' },
  '/dashboard/analytics': { title: 'Analytics', subtitle: 'Performance and payout intelligence' },
  '/dashboard/weather': { title: 'Weather Alerts', subtitle: 'Real-time disruption intelligence by city' },
  '/dashboard/notifications': { title: 'Notifications', subtitle: 'Important account and claim updates' },
  '/dashboard/kyc': { title: 'KYC', subtitle: 'Identity and payout verification status' },
  '/dashboard/referral': { title: 'Referrals', subtitle: 'Track rewards and invited workers' },
  '/dashboard/profile': { title: 'Profile', subtitle: 'Account details and payout settings' },
  '/dashboard/admin': { title: 'Admin Console', subtitle: 'Platform operations and monitoring' },
};

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/dashboard/policy', label: 'My Policy', icon: FiShield },
  { path: '/dashboard/claims', label: 'Claims', icon: FiFileText },
  { path: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/dashboard/weather', label: 'Weather Alerts', icon: FiCloud },
  { path: '/dashboard/notifications', label: 'Notifications', icon: FiBell, badge: true },
  { path: '/dashboard/kyc', label: 'KYC / Documents', icon: FiCreditCard },
  { path: '/dashboard/referral', label: 'Refer & Earn', icon: FiGift },
  { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
];

const ADMIN_ITEMS = [
  { path: '/dashboard/admin', label: 'Admin Panel', icon: FiSettings },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { worker, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, unreadCount, setUnreadCount } = useUIStore();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll({ unreadOnly: 'true', limit: 1 });
        setUnreadCount(res.data.unreadCount || 0);
      } catch { }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileSidebar(false);
  }, [location.pathname]);

  const isActiveCheck = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const currentMeta = Object.entries(PAGE_META).find(([path]) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path)
  )?.[1] || PAGE_META['/dashboard'];

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = ({ mobile = false }) => {
    const expanded = mobile || sidebarOpen;
    return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-glow">C</div>
          {expanded && <span className="font-display text-xl font-bold text-white">CLOVER</span>}
          </Link>
          {mobile && (
            <button onClick={() => setMobileSidebar(false)} className="btn-ghost p-2" aria-label="Close menu">
              <FiX className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Worker Card */}
      {expanded && (
        <div className="m-3 p-3 soft-glow-panel rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-sm">
              {worker?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{worker?.name}</p>
              <p className="text-gray-500 text-xs capitalize">{worker?.platform} · {worker?.city}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`badge text-xs ${worker?.riskCategory === 'low' ? 'badge-green' : worker?.riskCategory === 'high' ? 'badge-red' : 'badge-yellow'}`}>
              {worker?.riskCategory} risk
            </span>
            <span className="text-xs text-brand-300 font-medium inline-flex items-center gap-1">
              <FiStar className="text-xs" /> {worker?.loyaltyPoints || 0} pts
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {expanded && <p className="px-3 pb-1 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Main Navigation</p>}
        {NAV_ITEMS.map(item => (
          <Link key={item.path} to={item.path}
            onClick={() => setMobileSidebar(false)}
            title={!expanded ? item.label : undefined}
            className={`${isActiveCheck(item) ? 'sidebar-link-active' : 'sidebar-link'} ${!expanded ? 'justify-center px-0 h-11' : ''}`}>
            <item.icon className="text-[18px] shrink-0" />
            {expanded && (
              <span className={`flex-1 ${mobile ? 'text-[15px]' : 'text-sm'}`}>{item.label}</span>
            )}
            {expanded && item.badge && unreadCount > 0 && (
              <span className="w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        ))}
        {worker?.role === 'admin' && (
          <>
            <div className={`${expanded ? 'px-4' : 'px-2'} py-2`}>
              <div className="h-px bg-white/10" />
              {expanded && <p className="text-xs text-gray-600 font-medium mt-2 uppercase tracking-wider">Admin</p>}
            </div>
            {ADMIN_ITEMS.map(item => (
              <Link key={item.path} to={item.path}
                onClick={() => setMobileSidebar(false)}
                title={!expanded ? item.label : undefined}
                className={`${isActiveCheck(item) ? 'sidebar-link-active' : 'sidebar-link'} ${!expanded ? 'justify-center px-0 h-11' : ''}`}>
                <item.icon className="text-[18px] shrink-0" />
                {expanded && <span className={`${mobile ? 'text-[15px]' : 'text-sm'}`}>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout}
          title={!expanded ? 'Sign Out' : undefined}
          className={`sidebar-link w-full ${!expanded ? 'justify-center px-0 h-11' : ''}`}>
          <FiLogOut className="text-[18px] shrink-0" />
          {expanded && <span className={`${mobile ? 'text-[15px]' : 'text-sm'}`}>Sign Out</span>}
        </button>
      </div>
    </div>
  );
  };

  return (
    <div className="dashboard-bg flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-dark-800/80 backdrop-blur-xl border-r border-brand-500/20 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileSidebar(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[88vw] bg-dark-800/95 backdrop-blur-xl border-r border-brand-500/20 z-50 lg:hidden">
            <SidebarContent mobile />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-dark-800/70 backdrop-blur-xl border-b border-brand-500/20 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileSidebar(!mobileSidebar)} className="lg:hidden btn-ghost p-2"><FiMenu className="text-lg" /></button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex btn-ghost p-2 text-lg">
              {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </button>
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{currentMeta.title}</p>
              <p className="text-xs text-gray-400 truncate hidden sm:block">{currentMeta.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-xs text-gray-300 bg-brand-500/10 border border-brand-500/25 rounded-full px-3 py-1">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {worker?.activePolicyId ? (
              <span className="badge-green text-xs hidden sm:flex"><FiCheckCircle className="text-xs" /> Protected</span>
            ) : (
              <Link to="/dashboard/policy" className="badge-red text-xs hidden sm:flex cursor-pointer hover:opacity-80"><FiAlertTriangle className="text-xs" /> Not Covered</Link>
            )}
            <Link to="/dashboard/claims" className="btn-secondary text-xs py-1.5 px-3 hidden md:inline-flex"><FiPlusCircle className="text-sm" /> New Claim</Link>
            <Link to="/dashboard/notifications" className="relative btn-ghost p-2">
              <FiBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
