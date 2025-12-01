'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Activity, BarChart3, 
  Shield, Menu, X, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, MonitorSmartphone, TrendingUp,
  UserCheck, Calendar
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { adminAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: MonitorSmartphone, label: 'Sessions', href: '/admin/sessions' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: TrendingUp, label: 'Signups', href: '/admin/analytics/signups' },
  { icon: UserCheck, label: 'Retention', href: '/admin/analytics/retention' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await adminAPI.checkAdminStatus();
        setIsAdmin(response.isAdmin);
        if (!response.isAdmin) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
        router.push('/dashboard');
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  // Show loading while checking auth or admin status
  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth');
    return null;
  }

  // Redirect if not admin
  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle menu"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}
        `}
      >
        {/* Logo/Brand */}
        <div className={`h-14 flex items-center justify-between border-b border-sidebar-border ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}>
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">Admin</span>
                <span className="text-xs text-muted-foreground block -mt-1">Dashboard</span>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex w-7 h-7 rounded-full border border-sidebar-border items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors bg-sidebar ${isCollapsed ? 'absolute -right-3.5' : 'absolute -right-3.5'}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Admin Badge */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Admin Mode</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-1">
            {adminMenuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 rounded-lg transition-all relative group
                    ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                    ${isActive
                      ? 'bg-red-500 text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-border shadow-md">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-6 pt-6 border-t border-sidebar-border">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? "Back to Dashboard" : undefined}
              className={`
                flex items-center gap-3 rounded-lg transition-all text-muted-foreground hover:bg-accent hover:text-foreground
                ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
              `}
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Back to Dashboard</span>}
            </Link>
          </div>
        </nav>

        {/* Bottom Section - Theme Toggle & Logout */}
        <div className={`border-t border-sidebar-border ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
            className={`
              w-full flex items-center gap-3 rounded-lg transition-all text-muted-foreground hover:bg-accent hover:text-foreground mb-1
              ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
            `}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="font-medium text-sm">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`
              w-full flex items-center gap-3 rounded-lg transition-all text-muted-foreground hover:bg-destructive/10 hover:text-destructive
              ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
            `}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}`} />

      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
