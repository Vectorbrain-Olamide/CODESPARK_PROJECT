import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar, Footer } from '@/components/Navigation';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { LoadingScreen } from '@/components/ui/Feedback';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage, ResetPasswordPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReportPage } from '@/pages/ReportPage';
import { LiveMapPage } from '@/pages/LiveMapPage';
import { CalculatorsPage } from '@/pages/CalculatorsPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { RankingPage } from '@/pages/RankingPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DiscussionsPage } from '@/pages/DiscussionsPage';
import { PredictionPage } from '@/pages/PredictionPage';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';

const PROTECTED_ROUTES = ['/dashboard', '/report', '/profile', '/admin', '/assistant', '/discuss'];

function AppRoutes() {
  const { path, navigate } = useRouter();
  const { session, loading } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) { setUnreadCount(0); return; }
    (async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
      setUnreadCount(count ?? 0);
    })();
  }, [session, path]);

  // Redirect to login if accessing protected route without session
  useEffect(() => {
    if (!loading && !session && PROTECTED_ROUTES.some((r) => path.startsWith(r))) {
      navigate('/login');
    }
  }, [path, session, loading, navigate]);

  if (loading && PROTECTED_ROUTES.some((r) => path.startsWith(r))) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const showChrome = !['/login', '/signup', '/reset-password'].includes(path);

  let page;
  switch (path) {
    case '/':
      page = <LandingPage />;
      break;
    case '/login':
      page = <AuthPage mode="login" />;
      break;
    case '/signup':
      page = <AuthPage mode="signup" />;
      break;
    case '/reset-password':
      page = <ResetPasswordPage />;
      break;
    case '/dashboard':
      page = session ? <DashboardPage /> : <AuthPage mode="login" />;
      break;
    case '/report':
      page = session ? <ReportPage /> : <AuthPage mode="login" />;
      break;
    case '/map':
      page = <LiveMapPage />;
      break;
    case '/calculators':
      page = <CalculatorsPage />;
      break;
    case '/assistant':
      page = session ? <AssistantPage /> : <AuthPage mode="login" />;
      break;
    case '/ranking':
      page = <RankingPage />;
      break;
    case '/prediction':
      page = <PredictionPage />;
      break;
    case '/analytics':
      page = <AnalyticsPage />;
      break;
    case '/admin':
      page = session ? <AdminPage /> : <AuthPage mode="login" />;
      break;
    case '/profile':
      page = session ? <ProfilePage /> : <AuthPage mode="login" />;
      break;
    case '/discuss':
      page = <DiscussionsPage />;
      break;
    default:
      page = <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {showChrome && <Navbar unreadCount={unreadCount} onNotificationsClick={() => setNotifOpen(true)} />}
      <main className="flex-1">{page}</main>
      {showChrome && <Footer />}
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}

export default App;
