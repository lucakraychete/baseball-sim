import { Link } from 'react-router-dom';
import { appName } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

function useTheme() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return { dark, setDark } as const;
}

export default function Topbar() {
  const { dark, setDark } = useTheme();
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-950/50 border-b border-neutral-200/70 dark:border-neutral-800">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight">
          {appName}
        </Link>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800 px-3 text-sm"
          onClick={() => setDark(!dark)}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}<span className="hidden sm:inline">Theme</span>
        </button>
      </div>
    </header>
  );
}
