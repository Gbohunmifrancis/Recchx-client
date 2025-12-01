'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Mail, Calendar, MapPin, Briefcase, MoreVertical,
  Eye, Activity, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminUsersParams } from '@/types';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const params: AdminUsersParams = {
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminAPI.getUsers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleViewUser = async (userId: string) => {
    try {
      const userAnalytics = await adminAPI.getUserAnalytics(userId);
      setSelectedUser(userAnalytics);
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load users</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-xl p-4 mb-6 border border-border">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/50 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-2">Last Login</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {users.map((user: any, index: number) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                  >
                    {/* User Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Joined Date */}
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>

                    {/* Last Login */}
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 mr-2" />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user.id)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {users.length} of {pagination.totalUsers || 0} users
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

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">User Details</h2>
                <Button variant="outline" size="sm" onClick={() => setShowUserModal(false)}>
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selectedUser.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Role</p>
                    <p className="font-medium text-foreground">{selectedUser.currentRole || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Years of Experience</p>
                    <p className="font-medium text-foreground">{selectedUser.yearsOfExperience || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{selectedUser.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Onboarding Completed</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.onboardingCompleted ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mailbox Connected</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.mailboxConnected ? `Yes (${selectedUser.mailboxType})` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="font-medium text-foreground">{selectedUser.applicationCount || 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
