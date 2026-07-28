import { Zap } from 'lucide-react';

export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${className} flex items-center justify-center`}>
        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
          <path
            d="M24 2C14.6 2 7 9.6 7 19c0 10.4 12.5 23.6 16.1 27.2.5.5 1.3.5 1.8 0C28.5 42.6 41 29.4 41 19 41 9.6 33.4 2 24 2z"
            fill="url(#pp-grad)"
          />
          <path
            d="M26.5 11l-9 13h6l-1.5 9 9-13h-6l1.5-9z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="pp-grad" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          PowerPal <span className="text-blue-600">NG</span>
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Powering Smarter Communities
        </span>
      </div>
    </div>
  );
}

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <Zap className="absolute h-1/2 w-1/2 text-white" fill="white" />
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <path
          d="M24 2C14.6 2 7 9.6 7 19c0 10.4 12.5 23.6 16.1 27.2.5.5 1.3.5 1.8 0C28.5 42.6 41 29.4 41 19 41 9.6 33.4 2 24 2z"
          fill="url(#pp-mark-grad)"
        />
        <defs>
          <linearGradient id="pp-mark-grad" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
