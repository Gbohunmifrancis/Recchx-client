'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Mail,
  UserCircle,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { mockUser } from '@/lib/mock-data';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Prospects', href: '/dashboard/prospects', icon: Users },
  { name: 'Mailbox', href: '/dashboard/mailbox', icon: Mail },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen animated-gradient">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          className="fixed top-0 left-0 h-full w-72 z-50 lg:translate-x-0 lg:z-30"
        >
          <GlassCard variant="strong" className="h-full rounded-none lg:rounded-r-3xl p-6 flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gradient">Recchx</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-600 hover:text-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                        : 'text-slate-600 hover:bg-white/40'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Card */}
            <div className="mt-auto pt-6 border-t border-white/50">
              <div className="glass-card p-3 flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full ring-2 ring-white/50 overflow-hidden">
                  <Image
                    src={mockUser.avatar || 'https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff'}
                    alt={`${mockUser.firstName} ${mockUser.lastName}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {mockUser.firstName} {mockUser.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{mockUser.email}</p>
                </div>
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 rounded-xl transition-colors">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </GlassCard>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-20">
          <GlassCard variant="strong" className="rounded-none border-x-0 border-t-0">
            <div className="px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-800"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns, prospects..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 text-slate-600 hover:bg-white/40 rounded-xl transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-sky-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-white/40 rounded-xl transition-colors"
                  >
                    <div className="relative h-8 w-8 rounded-full ring-2 ring-white/50 overflow-hidden">
                      <Image
                        src={mockUser.avatar || 'https://ui-avatars.com/api/?name=User&background=0ea5e9&color=fff'}
                        alt={mockUser.firstName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-600 hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64"
                      >
                        <GlassCard variant="strong" className="p-3 space-y-2">
                          <div className="px-3 py-2">
                            <p className="text-sm font-medium text-slate-700">
                              {mockUser.firstName} {mockUser.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{mockUser.email}</p>
                          </div>
                          <div className="border-t border-white/50 pt-2">
                            <Link
                              href="/dashboard/profile"
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-white/40 rounded-lg transition-colors"
                            >
                              <UserCircle className="h-4 w-4" />
                              Profile Settings
                            </Link>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50/50 rounded-lg transition-colors">
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </GlassCard>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
