'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Loader2, Image as ImageIcon, CalendarDays, LogOut, Menu, X, CalendarCheck, Mail, Send, Users } from 'lucide-react';

const NAV = [
  { href: '/td-chef/reservations', label: 'Réservations', icon: CalendarCheck },
  { href: '/td-chef/programme', label: 'Programme', icon: CalendarDays },
  { href: '/td-chef', label: 'Médias', icon: ImageIcon, exact: true },
];

const NAV_NEWSLETTER = [
  { href: '/td-chef/newsletter', label: 'Abonnés', icon: Users, exact: true },
  { href: '/td-chef/newsletter/envoyer', label: 'Envoyer', icon: Send },
];

export default function TdChefLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/td-chef/login');
  };

  // Don't show sidebar on login page
  if (pathname === '/td-chef/login') return <>{children}</>;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-black/10 z-40 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E13027] flex items-center justify-center">
              <span className="text-white font-black italic text-sm">Z</span>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#0F0F0F]">ZFitSpa</p>
              <p className="text-[9px] uppercase tracking-wider text-black/40">Administration</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-all rounded-none
                  ${active
                    ? 'bg-[#E13027] text-white'
                    : 'text-black/50 hover:text-black hover:bg-black/5'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}

          {/* Newsletter group */}
          <div className="pt-3 pb-1">
            <div className="flex items-center gap-2 px-3 mb-1">
              <Mail className="w-3 h-3 text-black/25" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/25">Newsletter</p>
              <div className="flex-1 h-px bg-black/8" />
            </div>
            {NAV_NEWSLETTER.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-all rounded-none
                    ${active
                      ? 'bg-[#E13027] text-white'
                      : 'text-black/50 hover:text-black hover:bg-black/5'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-black/10">
          {user && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#0F0F0F] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <p className="text-[10px] text-black/50 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/40 hover:text-[#E13027] transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-black/10 bg-white">
          <button onClick={() => setOpen(true)} className="p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[12px] font-black uppercase tracking-widest">ZFitSpa Admin</span>
          <div className="w-7" />
        </div>

        <main className="flex-1 bg-white overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
