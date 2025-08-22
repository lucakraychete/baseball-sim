import { NavLink } from 'react-router-dom';
import { navItems } from '@/lib/theme';

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-60 p-3 sticky top-14 h-[calc(100dvh-56px)] border-r border-neutral-200/70 dark:border-neutral-800">
      <nav className="space-y-1">
        {navItems.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-brand-100 dark:bg-neutral-800 text-brand-700 dark:text-brand-300'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
