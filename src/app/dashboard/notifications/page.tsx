'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Loader2, Mail, Briefcase, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead 
} from '@/hooks/use-api';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_status_change':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'new_job_match':
        return <Briefcase className="h-5 w-5 text-emerald-600" />;
      case 'message':
        return <Mail className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Notifications</h1>
              <p className="text-slate-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="gap-2"
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark All Read
            </Button>
          )}
        </motion.div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-12 text-center">
              <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No notifications</h3>
              <p className="text-slate-600">You're all caught up! Check back later for updates.</p>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <GlassCard
                  className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                    !notification.read && !notification.isRead
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-500'
                      : 'bg-white/50'
                  }`}
                  onClick={() => {
                    if (!notification.read && !notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800">{notification.title}</h3>
                        {!notification.read && !notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-2">{notification.message}</p>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.data && (
                          <Badge className="text-xs bg-slate-100 text-slate-700">
                            {notification.type.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
