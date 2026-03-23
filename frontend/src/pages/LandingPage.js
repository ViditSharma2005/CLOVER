import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiCloudRain, FiCpu, FiDollarSign, FiMapPin, FiMenu, FiShield, FiX, FiZap } from 'react-icons/fi';

const STATS = [
  { label: 'Delivery Partners Protected', value: '2.4L+' },
  { label: 'Income Loss Paid', value: '₹4.8Cr+' },
  { label: 'Avg Payout Time', value: '< 2 hrs' },
  { label: 'Operational Cities', value: '28+' },
];

const FEATURES = [
  { Icon: FiCpu, title: 'AI Risk Pricing', desc: 'Weekly premium auto-adjusted to your city, route profile, and shift exposure so pricing stays fair for active riders.' },
  { Icon: FiZap, title: 'Auto Claim Trigger', desc: 'When verified weather or disruption thresholds are crossed, claim initiation happens automatically without forms.' },
  { Icon: FiShield, title: 'Smart Fraud Guard', desc: 'Anomaly checks on time, location, and duplicate behavior help keep payouts fast for genuine delivery partners.' },
  { Icon: FiDollarSign, title: 'Fast UPI Settlement', desc: 'Approved payouts move to UPI or bank quickly so your weekly cash cycle remains stable.' },
  { Icon: FiBarChart2, title: 'Earnings Protection Dashboard', desc: 'See payouts, risk movement, and coverage impact in one operational dashboard built for gig workflows.' },
  { Icon: FiCloudRain, title: 'Live Disruption Signals', desc: 'Track heat, rain, flood and AQI alerts in your service zones before your shifts are impacted.' },
];

const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Blinkit', 'Amazon', 'Flipkart', 'Dunzo'];

const HOW_IT_WORKS = [
  { step: '01', title: 'Quick Onboarding', desc: 'Register with phone, choose platform and city, and finish payout details in a few taps.' },
  { step: '02', title: 'Risk Profile Created', desc: 'Your earning pattern, route exposure, and city disruption history create a live weekly risk profile.' },
  { step: '03', title: 'Weekly Plan Activated', desc: 'Choose a weekly plan aligned to your earnings cycle, with clear trigger coverage and payout limits.' },
  { step: '04', title: 'Auto Protection In Action', desc: 'When verified disruption events occur, claim and payout flow starts with minimal manual effort.' },
];

export default function LandingPage() {
  const [activePlatform, setActivePlatform] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Support', href: '#footer' },
  ];

  useEffect(() => {
    const t = setInterval(() => setActivePlatform(p => (p + 1) % PLATFORMS.length), 2000);
    return () => clearInterval(t);
  }, []);

  const ShowcaseIllustration = () => (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-brand-500/25 via-brand-400/10 to-transparent blur-2xl" />
      <div className="relative card p-6 border-brand-400/35 overflow-hidden">
        <div className="absolute top-3 right-3 badge-orange text-[11px]">Live Parametric Engine</div>

        <div className="rounded-2xl bg-dark-800/85 border border-brand-500/30 p-4">
          <svg viewBox="0 0 360 220" className="w-full h-auto">
            <defs>
              <linearGradient id="road" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff6b00" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="360" height="220" rx="18" fill="#0b1120" />
            <path d="M20 170 C80 120, 130 170, 180 130 C230 95, 280 130, 340 80" stroke="url(#road)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="10 8" />

            <circle cx="60" cy="145" r="8" fill="#fb923c" />
            <circle cx="145" cy="148" r="8" fill="#fb923c" />
            <circle cx="225" cy="112" r="8" fill="#fb923c" />
            <circle cx="310" cy="95" r="8" fill="#fb923c" />

            <rect x="37" y="45" width="84" height="34" rx="10" fill="#111827" stroke="#ff6b00" />
            <text x="79" y="66" textAnchor="middle" fill="#fed7aa" fontSize="10" fontFamily="Manrope">AQI Alert</text>
            <text x="79" y="78" textAnchor="middle" fill="#fb923c" fontSize="10" fontFamily="Manrope">322 Severe</text>

            <rect x="132" y="24" width="98" height="38" rx="10" fill="#111827" stroke="#ff6b00" />
            <text x="181" y="45" textAnchor="middle" fill="#fed7aa" fontSize="10" fontFamily="Manrope">Weekly Cover</text>
            <text x="181" y="58" textAnchor="middle" fill="#fb923c" fontSize="10" fontFamily="Manrope">INR 2800</text>

            <rect x="248" y="136" width="88" height="38" rx="10" fill="#111827" stroke="#ff6b00" />
            <text x="292" y="157" textAnchor="middle" fill="#fed7aa" fontSize="10" fontFamily="Manrope">Payout ETA</text>
            <text x="292" y="170" textAnchor="middle" fill="#fb923c" fontSize="10" fontFamily="Manrope">Under 2h</text>
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="soft-panel p-2 text-center text-brand-200 inline-flex flex-col items-center gap-1"><FiMapPin /> City Signal</div>
          <div className="soft-panel p-2 text-center text-brand-200 inline-flex flex-col items-center gap-1"><FiActivity /> AI Risk</div>
          <div className="soft-panel p-2 text-center text-brand-200 inline-flex flex-col items-center gap-1"><FiShield /> Auto Payout</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="#top" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-sm font-bold">C</div>
              <span className="font-display text-xl font-bold text-white">CLOVER</span>
            </a>
            <span className="hidden lg:inline-flex section-chip py-1 px-2.5 text-[11px]">Built For Delivery Operations</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Protected</Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden btn-ghost p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl px-4 py-4 space-y-3">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block nav-link"
              >
                {item.label}
              </a>
            ))}
            <Link to="/login" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="top" className="pt-32 pb-24 px-4 relative">
        <div className="absolute inset-0 bg-hero-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
          <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-brand-500/12 border border-brand-500/35 rounded-full px-4 py-2 text-sm text-brand-300 font-medium mb-8 hero-halo">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            Live protection for {activePlatform !== undefined ? PLATFORMS[activePlatform] : 'Zomato'} delivery partners
          </div>

          <h1 className="font-display hero-title-pop text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6">
            <span className="hero-line hero-line-1">India&apos;s First</span>
            <span className="hero-line hero-line-2 hero-animated-word">AI Income Shield</span>
            <span className="hero-line hero-line-3">for Delivery Partners</span>
          </h1>

          <p className="hero-subtext text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Extreme heat, flood alerts, severe pollution and city disruptions can stop shifts instantly.
            <strong> CLOVER helps recover weekly income</strong> with automated parametric payouts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-4 px-8 text-center">
              Start from ₹49/week →
            </Link>
            <Link to="/login" className="btn-secondary text-base py-4 px-8 text-center">
              Open My Dashboard
            </Link>
          </div>

          <p className="text-gray-600 text-sm mt-4">Weekly pricing · Instant onboarding · UPI-first payout</p>
          </div>

          <div className="animate-float-soft">
            <ShowcaseIllustration />
          </div>
        </div>

        {/* Stats row */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="font-display text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="py-12 border-y border-dark-700 bg-dark-800/40">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-6 uppercase tracking-widest font-medium">Optimized for partners on</p>
          <div className="flex flex-wrap justify-center gap-4">
            {PLATFORMS.map((p, i) => (
              <div key={p} className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 ${i === activePlatform ? 'border-brand-500 bg-brand-500/15 text-brand-400' : 'border-dark-600 bg-dark-700 text-gray-400'}`}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Designed like top delivery apps</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Fast flows, high-contrast actions, and operational clarity inspired by modern delivery partner experiences.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover group">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mb-4">
                  <f.Icon className="text-2xl text-brand-300" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-dark-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">How CLOVER Runs</h2>
            <p className="text-gray-400 text-lg">Simple. Fast. Automated.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={h.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-500/40 to-transparent z-10" />
                )}
                <div className="card text-center">
                  <div className="font-mono text-brand-500 text-3xl font-bold mb-3">{h.step}</div>
                  <h3 className="font-semibold text-white mb-2">{h.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Weekly plans for weekly earnings</h2>
            <p className="text-gray-400">Operationally aligned to how delivery partners actually get paid.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Basic Shield', price: '₹49', coverage: '₹1,800', triggers: 3, color: 'border-dark-600', badge: '' },
              { name: 'Standard Shield', price: '₹89', coverage: '₹2,800', triggers: 6, color: 'border-brand-500', badge: 'Most Popular' },
              { name: 'Premium Shield', price: '₹139', coverage: '₹4,000', triggers: 11, color: 'border-dark-600', badge: '' },
            ].map((plan) => (
              <div key={plan.name} className={`card border-2 ${plan.color} relative`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-orange text-xs">{plan.badge}</div>
                )}
                <h3 className="font-display font-bold text-white mb-1">{plan.name}</h3>
                <div className="font-display text-3xl font-bold gradient-text mb-1">{plan.price}<span className="text-gray-500 text-base font-normal">/week</span></div>
                <div className="text-gray-400 text-sm mb-4">Up to {plan.coverage} coverage</div>
                <div className="text-brand-400 text-sm font-medium">{plan.triggers} disruption types covered</div>
                <Link to="/register" className="btn-primary w-full text-center mt-4 block text-sm py-2.5">Get Started →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-brand-500/30 bg-gradient-to-b from-brand-500/5 to-transparent">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/35 text-brand-300 mx-auto mb-4 flex items-center justify-center">
              <FiShield className="text-3xl" />
            </div>
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">Make every disrupted day recoverable</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">One severe weather event can wipe out a full week of deliveries. Activate coverage that responds with speed and consistency.</p>
            <Link to="/register" className="btn-primary text-base py-4 px-10 inline-block">
              Get Protected — Starting ₹49/week
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-white/10 py-14 px-4 bg-dark-800/45 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center text-xs font-bold">C</div>
              <span className="font-display font-bold text-white text-lg">CLOVER</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI-powered parametric income protection for India&apos;s gig workers. Built for speed, fairness, and zero-paper claims.
            </p>
            <p className="text-gray-500 text-xs mt-4">© 2026 CLOVER. All rights reserved.</p>
          </div>

          <div>
            <p className="text-white font-semibold mb-4">Product</p>
            <div className="space-y-2">
              <a href="#features" className="footer-link">Core Features</a>
              <a href="#pricing" className="footer-link block">Pricing Plans</a>
              <a href="#how-it-works" className="footer-link block">How It Works</a>
            </div>
          </div>

          <div>
            <p className="text-white font-semibold mb-4">Company</p>
            <div className="space-y-2">
              <a href="#" className="footer-link block">Privacy Policy</a>
              <a href="#" className="footer-link block">Terms of Service</a>
              <a href="#" className="footer-link block">Help Center</a>
            </div>
          </div>

          <div>
            <p className="text-white font-semibold mb-4">Get Started</p>
            <p className="text-gray-400 text-sm mb-4">Create your profile and get covered in under 2 minutes.</p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <Link to="/register" className="btn-primary text-sm text-center py-2.5">Start Protection</Link>
              <Link to="/login" className="btn-secondary text-sm text-center py-2.5">Open Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
