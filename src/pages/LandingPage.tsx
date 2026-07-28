import { useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import {
  Zap, MapPin, TrendingUp, Bot, Calculator, Bell, Shield, Users,
  ArrowRight, Star, ChevronDown, Plug, Activity, Award,
} from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    { icon: MapPin, title: 'Live Outage Map', desc: 'See real-time power status across Nigerian communities with color-coded indicators.' },
    { icon: Zap, title: 'Report Outages', desc: 'Report outages, low voltage, transformer faults, and more in seconds.' },
    { icon: TrendingUp, title: 'Power Prediction', desc: 'AI estimates outage probability, restoration time, and best electricity hours.' },
    { icon: Bot, title: 'PowerBot AI', desc: 'Ask about outages, inverter vs generator, and fuel-saving tips.' },
    { icon: Calculator, title: 'Cost Calculators', desc: 'Calculate generator fuel costs and inverter sizing for your appliances.' },
    { icon: Award, title: 'Community Ranking', desc: 'See which communities have the most reliable electricity.' },
  ];

  const testimonials = [
    { name: 'Chioma A.', role: 'Lekki, Lagos', text: 'PowerPal NG helped me plan my work hours around actual electricity schedules. The predictions are spot on.', rating: 5 },
    { name: 'Ibrahim M.', role: 'Garki, Abuja', text: 'I reported an outage and within minutes my neighbors confirmed it. The community aspect is powerful.', rating: 5 },
    { name: 'Funmi O.', role: 'Surulere, Lagos', text: 'The generator calculator showed me I was spending ₦45,000/month. Got an inverter and never looked back.', rating: 5 },
  ];

  const faqs = [
    { q: 'Is PowerPal NG free to use?', a: 'Yes, PowerPal NG is completely free. Sign up with your email or Google account to start reporting and tracking power in your community.' },
    { q: 'How does the live map work?', a: 'The map aggregates community reports and power history data to show real-time electricity status. Green means stable, yellow means unstable, red means an active outage.' },
    { q: 'Can I report an outage anonymously?', a: 'You need an account to report outages to prevent spam and fake reports. However, your personal information is never shared publicly.' },
    { q: 'How accurate are the AI predictions?', a: 'Predictions improve as more community members report. The more reports your area receives, the more accurate the outage probability and restoration estimates become.' },
    { q: 'Which states are supported?', a: 'We currently cover Lagos, Abuja FCT, Rivers, Oyo, Kano, Enugu, and Kaduna with plans to expand to all 36 states.' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-96 w-96 rounded-full bg-electric-200/40 dark:bg-electlectric-900/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                Live across 7 Nigerian states
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Know When the Lights Go Out—
                <span className="text-blue-600">And When They're Coming Back.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                Community-powered electricity tracking for Nigeria. Monitor supply, report outages, estimate costs, and make smarter power decisions.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/report')} className="btn-primary text-base px-6 py-3">
                  <Zap className="h-5 w-5" /> Report Outage
                </button>
                <button onClick={() => navigate('/map')} className="btn-secondary text-base px-6 py-3">
                  <MapPin className="h-5 w-5" /> View Live Map
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> Free to use</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /> Community-driven</div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl glass p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your community</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Ikeja GRA, Lagos</p>
                  </div>
                  <div className="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Stable
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                    <p className="text-xs text-slate-500">Today</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">18.5h</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                    <p className="text-xs text-slate-500">Reliability</p>
                    <p className="text-xl font-bold text-blue-600">82%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                    <p className="text-xs text-slate-500">Reports</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
                  </div>
                </div>
                {/* Mini chart */}
                <div className="flex items-end gap-1.5 h-24 mb-4">
                  {[40, 65, 80, 55, 90, 70, 95, 60, 85, 75, 50, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-electric-50 dark:bg-electric-950/30 p-3">
                  <Activity className="h-5 w-5 text-electric-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">PowerBot:</span> Power likely stable until 8 PM tonight.
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 rounded-2xl bg-white dark:bg-slate-800 shadow-lg p-3 flex items-center gap-2 animate-float">
                <Plug className="h-5 w-5 text-electric-500" />
                <div>
                  <p className="text-xs text-slate-500">Saved</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">₦45k/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything you need to stay powered
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              From real-time outage maps to AI predictions and cost calculators, PowerPal NG gives you the tools to take control of your power situation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card p-6 hover:shadow-md transition-all hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Loved by communities across Nigeria
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-electric-400 text-electric-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-slate-900 dark:text-white">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-electric-400/20 blur-3xl" />
            <div className="relative z-10">
              <Bell className="h-10 w-10 text-white mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Start tracking power in your community
              </h2>
              <p className="mt-4 text-blue-100 max-w-xl mx-auto">
                Join thousands of Nigerians making smarter power decisions every day.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/signup')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-all active:scale-[0.98]">
                  Get started free <ArrowRight className="h-5 w-5" />
                </button>
                <button onClick={() => navigate('/map')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-all">
                  Explore the map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
