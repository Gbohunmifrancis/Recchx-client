'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MonitorSmartphone, Search, ChevronLeft, ChevronRight,
  Globe, Clock, User, Activity, Loader2, CheckCircle,
  XCircle, Smartphone, Monitor, MapPin
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { AllSessionsParams, UserSession } from '@/types';

export default function AdminSessionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(false);

  const params: AllSessionsParams = {
    page: currentPage,
    limit: 20,
    activeOnly: activeOnly || undefined,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sessions', params],
    queryFn: () => adminAPI.getAllSessions(params),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  const sessions = data?.sessions || [];
  const pagination = data?.pagination;

  const getDeviceIcon = (deviceInfo: string) => {
    const lower = deviceInfo?.toLowerCase() || '';
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load sessions</p>
          <p className="text-muted-foreground text-sm">{(error as any)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Session Management</h1>
          <p className="text-muted-foreground">Monitor all active user sessions</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 mb-6 border border-border flex flex-wrap items-center gap-4">
          <Button
            variant={activeOnly ? 'primary' : 'outline'}
            onClick={() => {
              setActiveOnly(!activeOnly);
              setCurrentPage(1);
            }}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            {activeOnly ? 'Showing Active Only' : 'Show Active Only'}
          </Button>
          <div className="flex-1" />
          <p className="text-sm text-muted-foreground">
            Auto-refreshes every minute
          </p>
        </div>

        {/* Sessions Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <MonitorSmartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No sessions found</h3>
              <p className="text-muted-foreground">There are no {activeOnly ? 'active ' : ''}sessions to display</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/50 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Device</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-2">Last Activity</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Expires</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {sessions.map((session: UserSession, index: number) => {
                  const DeviceIcon = getDeviceIcon(session.deviceInfo);
                  return (
                    <motion.div
                      key={session.id || session.sessionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                    >
                      {/* User Info */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {session.userName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {session.userEmail || session.userId}
                          </p>
                        </div>
                      </div>

                      {/* Device */}
                      <div className="col-span-2 flex items-center gap-2">
                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground truncate">
                          {session.deviceInfo || 'Unknown Device'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="col-span-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {session.ipInfo ? (
                            <span className="text-foreground">
                              {session.ipInfo.city}, {session.ipInfo.country}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{session.ipAddress}</span>
                          )}
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="col-span-2 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {formatTimeAgo(session.lastActivityAt)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center">
                        {session.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                            <XCircle className="h-3 w-3" />
                            {session.revokedAt ? 'Revoked' : 'Expired'}
                          </span>
                        )}
                      </div>

                      {/* Expires */}
                      <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                        {session.expiresAt ? new Date(session.expiresAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {sessions.length} of {pagination.totalSessions || pagination.totalCount || 0} sessions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
