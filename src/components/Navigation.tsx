import { useState } from 'react';
import { Menu, X, Sun, Moon, Bell, LogOut, User as UserIcon, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/Logo';

interface NavbarProps {
  unreadCount: number;
  onNotificationsClick: () => void;
}

export function Navbar({ unreadCount, onNotificationsClick }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { navigate, path } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Live Map', path: '/map' },
    { label: 'Report', path: '/report' },
    { label: 'Ranking', path: '/ranking' },
    { label: 'Prediction', path: '/prediction' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'PowerBot', path: '/assistant' },
    { label: 'Calculators', path: '/calculators' },
  ];

  const isActive = (p: string) => path === p || path.startsWith(p + '/');

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => navigate(profile ? '/dashboard' : '/')} className="shrink-0">
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.path)
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {profile && (
              <>
                <button
                  onClick={onNotificationsClick}
                  className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {profile.full_name?.[0]?.toUpperCase() ?? <UserIcon className="h-4 w-4" />}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                      {profile.full_name || 'Profile'}
                    </span>
                  </button>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl glass-strong shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 animate-scale-in">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{profile.full_name || 'User'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                        </div>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </button>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <UserIcon className="h-4 w-4" /> Edit Profile
                        </button>
                        {profile.is_admin && (
                          <button
                            onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Shield className="h-4 w-4" /> Admin
                          </button>
                        )}
                        <button
                          onClick={() => { setProfileOpen(false); signOut(); navigate('/'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {!profile && (
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => navigate('/login')} className="btn-ghost">Login</button>
                <button onClick={() => navigate('/signup')} className="btn-primary">Get Started</button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 animate-slide-up">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => { navigate(l.path); setMenuOpen(false); }}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(l.path)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {l.label}
                </button>
              ))}
              {!profile && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="btn-secondary flex-1">Login</button>
                  <button onClick={() => { navigate('/signup'); setMenuOpen(false); }} className="btn-primary flex-1">Sign Up</button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const { navigate } = useRouter();
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Community-powered electricity tracking for Nigeria. Know when the lights go out—and when they're coming back.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-blue-600">Dashboard</button></li>
              <li><button onClick={() => navigate('/map')} className="hover:text-blue-600">Live Map</button></li>
              <li><button onClick={() => navigate('/report')} className="hover:text-blue-600">Report Outage</button></li>
              <li><button onClick={() => navigate('/calculators')} className="hover:text-blue-600">Calculators</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><button onClick={() => navigate('/ranking')} className="hover:text-blue-600">Ranking</button></li>
              <li><button onClick={() => navigate('/analytics')} className="hover:text-blue-600">Analytics</button></li>
              <li><button onClick={() => navigate('/assistant')} className="hover:text-blue-600">PowerBot AI</button></li>
              <li><button onClick={() => navigate('/discuss')} className="hover:text-blue-600">Discussions</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><button onClick={() => navigate('/')} className="hover:text-blue-600">About</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-blue-600">Privacy</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-blue-600">Terms</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-blue-600">Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 PowerPal NG. Powering Smarter Communities.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Made in Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
