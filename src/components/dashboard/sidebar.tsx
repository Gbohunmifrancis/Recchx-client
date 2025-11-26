'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Briefcase, Mail, Settings, User, LogOut,
  Menu, X, TrendingUp, FileText, Bell, Activity, FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

const menuSections = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', badge: null },
    ]
  },
  {
    title: 'Job Search',
    items: [
      { icon: Briefcase, label: 'Job Matches', href: '/dashboard/jobs', badge: null },
      { icon: TrendingUp, label: 'Applications', href: '/dashboard/applications', badge: null },
    ]
  },
  {
    title: 'Management',
    items: [
      { icon: Mail, label: 'Mailbox', href: '/dashboard/mailbox', badge: null },
      { icon: FileText, label: 'Documents', href: '/dashboard/documents', badge: null },
      { icon: Activity, label: 'Job Sources', href: '/dashboard/sources', badge: null },
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', href: '/dashboard/profile', badge: null },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings', badge: null },
    ]
  }
];

export function DashboardSidebar({ user, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg glass-card flex items-center justify-center text-slate-700 hover:text-emerald-600 transition-colors"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-64 bg-slate-800/95 backdrop-blur-lg border-r border-slate-700 z-40 md:relative md:translate-x-0 flex flex-col shadow-2xl"
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-white">Recch</span>
              <span className="text-emerald-400">x</span>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full gap-2 justify-start text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Desktop Sidebar Toggle (Optional) */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .dashboard-layout {
            display: grid;
            grid-template-columns: 256px 1fr;
          }
        }
      `}</style>
    </>
  );
}
