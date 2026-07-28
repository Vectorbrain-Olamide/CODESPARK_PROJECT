import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/Logo';
import { Spinner } from '@/components/ui/Feedback';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast(error, 'error');
      } else {
        toast('Account created! Check your email or sign in.', 'success');
        navigate('/login');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast(error, 'error');
      } else {
        toast('Welcome back!', 'success');
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) toast(error, 'error');
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-electric-400 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-blue-400 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <Logo className="h-10 w-10" />
          <h1 className="mt-12 text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Know When the Lights Go Out—And When They're Coming Back.
          </h1>
          <p className="mt-6 text-lg text-blue-100 max-w-md">
            Community-powered electricity tracking for Nigeria. Join thousands monitoring power in real time.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold">19+</p>
              <p className="text-sm text-blue-200">Communities</p>
            </div>
            <div className="h-10 w-px bg-blue-400/40" />
            <div>
              <p className="text-3xl font-bold">7</p>
              <p className="text-sm text-blue-200">States</p>
            </div>
            <div className="h-10 w-px bg-blue-400/40" />
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-blue-200">Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/')} className="lg:hidden mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back home
          </button>
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signup' ? 'Start monitoring power in your community.' : 'Sign in to your PowerPal NG account.'}
          </p>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-secondary w-full mt-6"
          >
            {googleLoading ? <Spinner className="h-4 w-4" /> : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adebayo Johnson"
                    className="input pl-10"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => navigate('/reset-password')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner className="h-4 w-4" /> : null}
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => navigate(mode === 'signup' ? '/login' : '/signup')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast(error, 'error');
    } else {
      setSent(true);
      toast('Password reset link sent!', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo />
        </div>
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset password</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we'll send you a reset link.
          </p>
          {sent ? (
            <div className="mt-6 rounded-xl bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-700 dark:text-green-300">
              Check your inbox for the reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Spinner className="h-4 w-4" /> : null}
                Send reset link
              </button>
            </form>
          )}
          <button onClick={() => navigate('/login')} className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
