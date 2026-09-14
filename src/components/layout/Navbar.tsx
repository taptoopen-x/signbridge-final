import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/sign-to-text', label: 'Sign → Text' },
  { to: '/text-to-sign', label: 'Text → Sign' },
  { to: '/conversation', label: 'Conversation' },
  { to: '/quick-phrases', label: 'Quick Phrases' },
  { to: '/learn', label: 'Learn ISL' },
  { to: '/about', label: 'About' },
  { to: '/training', label: '🔒 Training' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 focus-ring rounded-lg"
        >
          <span className="h-8 w-8 rounded-lg bg-signal-500 text-base-950 flex items-center justify-center font-display font-bold">
            S
          </span>

          <span className="font-display font-semibold text-lg tracking-tight">
            SignBridge
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-mist hover:text-white hover:bg-white/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
          aria-label="Toggle navigation"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <nav className="lg:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-mist hover:text-white hover:bg-white/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}