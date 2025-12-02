/**
 * Custom React Hooks for API Data Fetching
 * Uses React Query for caching, automatic refetching, and state management
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  // Profile
  ProfileData,
  ProfileResponse,
  // Jobs
  JobMatchParams,
  JobSearchParams,
  JobMatchesResponse,
  JobSearchResponse,
  Job,
  ApplyToJobData,
  // Applications
  ApplicationParams,
  ApplicationsResponse,
  Application,
  UpdateApplicationRequest,
  // Dashboard
  DashboardStats,
  // Notifications
  NotificationParams,
  NotificationsResponse,
  // Settings
  UserSettings,
  // Documents
  DocumentsResponse,
  // Mailbox
  MailboxStatusResponse,
  // Job Sources
  JobSourcesHealthResponse,
  JobSourcesListResponse,
} from '@/types';

// =====================================================
// QUERY KEYS
// =====================================================

export const queryKeys = {
  profile: ['profile'] as const,
  jobs: {
    all: ['jobs'] as const,
    matches: (params?: JobMatchParams) => ['jobs', 'matches', params] as const,
    search: (params: JobSearchParams) => ['jobs', 'search', params] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: (params?: ApplicationParams) => ['applications', 'list', params] as const,
    detail: (id: string) => ['applications', 'detail', id] as const,
  },
  dashboard: ['dashboard'] as const,
  notifications: {
    all: ['notifications'] as const,
    list: (params?: NotificationParams) => ['notifications', 'list', params] as const,
  },
  settings: ['settings'] as const,
  documents: ['documents'] as const,
  mailbox: ['mailbox'] as const,
  jobSources: {
    health: ['jobSources', 'health'] as const,
    list: ['jobSources', 'list'] as const,
  },
};

// =====================================================
// PROFILE HOOKS
// =====================================================

/**
 * Get user profile
 */
export function useProfile(options?: UseQueryOptions<ProfileResponse>) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const data = await api.profile.getProfile();
      console.log('Profile fetched:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    ...options,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileData) => api.profile.updateProfile(data),
    onSuccess: (response) => {
      console.log('Profile updated successfully:', response);
      // Invalidate profile cache to force refetch with fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      // Invalidate dashboard to reflect profile changes
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
}

/**
 * Upload resume
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.profile.uploadResume(file),
    onSuccess: () => {
      // Invalidate documents list
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      // Invalidate profile to update completeness
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

/**
 * Upload profile picture
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.profile.uploadProfilePicture(file),
    onSuccess: (response) => {
      console.log('Profile picture uploaded successfully:', response);
      
      // The backend returns the picture URL but might not save it to profile
      // So we manually update the cache with the new URL
      if (response.profilePictureUrl) {
        // Update profile cache with new picture URL
        queryClient.setQueryData(queryKeys.profile, (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              profilePictureUrl: response.profilePictureUrl,
            };
          }
          return oldData;
        });
      }
      
      // Also invalidate to trigger refetch (in case backend does save it)
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      // Invalidate dashboard to refresh sidebar avatar
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      console.error('Profile picture upload failed:', error);
    },
  });
}

// =====================================================
// JOBS HOOKS
// =====================================================

/**
 * Get job matches
 */
export function useJobMatches(params?: JobMatchParams) {
  return useQuery({
    queryKey: queryKeys.jobs.matches(params),
    queryFn: () => api.jobs.getMatches(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Search jobs
 */
export function useJobSearch(params: JobSearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.jobs.search(params),
    queryFn: () => api.jobs.searchJobs(params),
    enabled: enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get job details by ID
 */
export function useJobDetail(jobId: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => api.jobs.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Apply to a job
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: ApplyToJobData }) =>
      api.jobs.applyToJob(jobId, data),
    onSuccess: (_, variables) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      // Invalidate job detail to update isApplied status
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(variables.jobId) });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// =====================================================
// APPLICATIONS HOOKS
// =====================================================

/**
 * Get all applications
 */
export function useApplications(params?: ApplicationParams) {
  return useQuery({
    queryKey: queryKeys.applications.list(params),
    queryFn: () => api.applications.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get application details
 */
export function useApplicationDetail(applicationId: string) {
  return useQuery({
    queryKey: queryKeys.applications.detail(applicationId),
    queryFn: () => api.applications.getById(applicationId),
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update application status
 */
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationRequest }) =>
      api.applications.updateStatus(id, data),
    onSuccess: (_, variables) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      // Invalidate application detail
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(variables.id) });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

/**
 * Withdraw application
 */
export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => api.applications.withdraw(applicationId),
    onSuccess: () => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// =====================================================
// DASHBOARD HOOKS
// =====================================================

/**
 * Get dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.dashboard.getStats(),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// =====================================================
// NOTIFICATIONS HOOKS
// =====================================================

/**
 * Get notifications
 */
export function useNotifications(params?: NotificationParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => api.notifications.getAll(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => api.notifications.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// =====================================================
// SETTINGS HOOKS
// =====================================================

/**
 * Get user settings
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => api.settings.get(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UserSettings) => api.settings.update(settings),
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(queryKeys.settings, data.settings);
    },
  });
}

// =====================================================
// DOCUMENTS HOOKS
// =====================================================

/**
 * Get all documents
 */
export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => api.documents.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Delete document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => api.documents.delete(documentId),
    onSuccess: () => {
      // Invalidate documents list
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    },
  });
}

/**
 * Set primary document
 */
export function useSetPrimaryDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => api.documents.setPrimary(documentId),
    onSuccess: () => {
      // Invalidate documents list
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    },
  });
}

// =====================================================
// MAILBOX HOOKS
// =====================================================

/**
 * Get mailbox status
 */
export function useMailboxStatus(provider?: string) {
  return useQuery({
    queryKey: [...queryKeys.mailbox, provider] as const,
    queryFn: () => api.mailbox.getStatus(provider),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Connect mailbox (initiates OAuth)
 */
export function useConnectMailbox() {
  return useMutation({
    mutationFn: (provider: 'Gmail' | 'Outlook') => api.mailbox.connect(provider),
    onSuccess: (data) => {
      // Redirect to OAuth URL
      window.location.href = data.authorizationUrl;
    },
  });
}

/**
 * Disconnect mailbox
 */
export function useDisconnectMailbox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: 'Gmail' | 'Outlook') => api.mailbox.disconnect(provider),
    onSuccess: () => {
      // Invalidate mailbox status
      queryClient.invalidateQueries({ queryKey: queryKeys.mailbox });
    },
  });
}

// =====================================================
// JOB SOURCES HOOKS
// =====================================================

/**
 * Get job sources health
 */
export function useJobSourcesHealth() {
  return useQuery({
    queryKey: queryKeys.jobSources.health,
    queryFn: () => api.jobSources.getHealth(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get job sources list
 */
export function useJobSourcesList() {
  return useQuery({
    queryKey: queryKeys.jobSources.list,
    queryFn: () => api.jobSources.getList(),
    staleTime: 1000 * 60 * 60, // 1 hour (this data rarely changes)
  });
}

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Prefetch job matches (for optimization)
 */
export function usePrefetchJobMatches() {
  const queryClient = useQueryClient();

  return (params?: JobMatchParams) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.matches(params),
      queryFn: () => api.jobs.getMatches(params),
    });
  };
}

/**
 * Invalidate all queries (for force refresh)
 */
export function useInvalidateAll() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries();
  };
}
