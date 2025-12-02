'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Briefcase, Send, FileText, 
  User, Settings, Menu, X, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Bell, Shield
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { adminAPI } from '@/lib/api';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

// Helper functions for user display
const getDisplayName = (user: any) => {
  if (user?.fullName) return user.fullName;
  if (user?.firstName || user?.lastName) {
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  }
  if (user?.email) {
    return user.email.split('@')[0];
  }
  return 'User';
};

const getInitials = (user: any) => {
  const name = getDisplayName(user);
  const parts = name.split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', href: '/dashboard/jobs' },
  { icon: Send, label: 'Applications', href: '/dashboard/applications' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function DashboardSidebar({ user, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Check if user is admin on mount
  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await adminAPI.checkAdminStatus();
        setIsAdmin(response.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <>
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
          ${isCollapsed ? 'w-[70px]' : 'w-[240px]'}
        `}
      >
        {/* Logo/Brand */}
        <div className={`h-14 flex items-center justify-between border-b border-sidebar-border ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}>
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold text-foreground">Recchx</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
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

        {/* User Profile - only show when expanded */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              {user?.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl}
                  alt={getDisplayName(user)}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {getInitials(user)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getDisplayName(user)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email ? `${user.email.slice(0, 3)}${'*'.repeat(Math.min(Math.max(user.email.indexOf('@') - 3, 0), 5))}${user.email.slice(user.email.indexOf('@'))}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User avatar when collapsed */}
        {isCollapsed && (
          <div className="py-3 flex justify-center border-b border-sidebar-border">
            {user?.profilePictureUrl ? (
              <Image
                src={user.profilePictureUrl}
                alt={getDisplayName(user)}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {getInitials(user)}
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
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
                      ? 'bg-primary text-primary-foreground'
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

            {/* Admin Link - Only show for admin users */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? 'Admin Dashboard' : undefined}
                className={`
                  flex items-center gap-3 rounded-lg transition-all relative group mt-4 pt-4 border-t border-sidebar-border
                  ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                  ${pathname.startsWith('/admin')
                    ? 'bg-red-500 text-white'
                    : 'text-red-500 hover:bg-red-500/10'
                  }
                `}
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">Admin</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-border shadow-md">
                    Admin Dashboard
                  </div>
                )}
              </Link>
            )}
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
            onClick={onLogout}
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
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-[240px]'}`} />
    </>
  );
}
