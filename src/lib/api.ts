/**
 * Complete API Service Layer for Recchx Frontend
 * Base URL: https://recchx-d32fdfb574a8.herokuapp.com
 * 
 * This file contains all API endpoints organized by feature area
 */

import apiClient from './api-client';
import type {
  // Auth
  SignUpData,
  LoginData,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  // Profile
  ProfileData,
  ProfileResponse,
  ResumeUploadResponse,
  // Jobs
  JobMatchParams,
  JobSearchParams,
  JobMatchesResponse,
  JobSearchResponse,
  Job,
  ApplyToJobData,
  ApplyToJobResponse,
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
  MailboxConnectResponse,
  MailboxStatusResponse,
  // Job Sources
  JobSourcesHealthResponse,
  JobSourcesListResponse,
  // Codelists
  CodelistResponse,
  // Admin
  AdminUsersResponse,
} from '@/types';

// =====================================================
// AUTHENTICATION API
// =====================================================

export const authAPI = {
  /**
   * Register a new user
   */
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/refresh', data);
    return response.data;
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Logout all sessions
   */
  logoutAll: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/logout-all');
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },
};

// =====================================================
// USER PROFILE API
// =====================================================

export const profileAPI = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },

  /**
   * Create or update user profile
   */
  updateProfile: async (data: ProfileData): Promise<{ success?: boolean; profileId?: string; message?: string; profile?: ProfileResponse }> => {
    const response = await apiClient.post('/api/user/profile', data);
    return response.data;
  },

  /**
   * Upload resume
   */
  uploadResume: async (file: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/user/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// =====================================================
// JOBS API
// =====================================================

export const jobsAPI = {
  /**
   * Get job matches based on user profile
   */
  getMatches: async (params?: JobMatchParams): Promise<JobMatchesResponse> => {
    const response = await apiClient.get('/api/jobs/matches', { params });
    return response.data;
  },

  /**
   * Get job details by ID
   */
  getJobById: async (jobId: string): Promise<Job> => {
    const encodedId = encodeURIComponent(jobId);
    const response = await apiClient.get(`/api/jobs/${encodedId}`);
    return response.data;
  },

  /**
   * Apply to a job
   */
  applyToJob: async (jobId: string, data: ApplyToJobData): Promise<ApplyToJobResponse> => {
    const response = await apiClient.post(`/api/jobs/${jobId}/apply`, data);
    return response.data;
  },

  /**
   * Search jobs with custom criteria
   */
  searchJobs: async (params: JobSearchParams): Promise<JobSearchResponse> => {
    const response = await apiClient.get('/api/jobs/search', { params });
    return response.data;
  },
};

// =====================================================
// APPLICATIONS API
// =====================================================

export const applicationsAPI = {
  /**
   * Get all applications
   */
  getAll: async (params?: ApplicationParams): Promise<ApplicationsResponse> => {
    const response = await apiClient.get('/api/applications', { params });
    return response.data;
  },

  /**
   * Get application details
   */
  getById: async (applicationId: string): Promise<Application> => {
    const response = await apiClient.get(`/api/applications/${applicationId}`);
    return response.data;
  },

  /**
   * Update application status
   */
  updateStatus: async (
    applicationId: string,
    data: UpdateApplicationRequest
  ): Promise<{ message: string; application: Application }> => {
    const response = await apiClient.put(`/api/applications/${applicationId}`, data);
    return response.data;
  },

  /**
   * Withdraw application
   */
  withdraw: async (applicationId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/applications/${applicationId}`);
    return response.data;
  },
};

// =====================================================
// DASHBOARD API
// =====================================================

export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },
};

// =====================================================
// NOTIFICATIONS API
// =====================================================

export const notificationsAPI = {
  /**
   * Get notifications
   */
  getAll: async (params?: NotificationParams): Promise<NotificationsResponse> => {
    const response = await apiClient.get('/api/notifications', { params });
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string; count: number }> => {
    const response = await apiClient.put('/api/notifications/read-all');
    return response.data;
  },
};

// =====================================================
// SETTINGS API
// =====================================================

export const settingsAPI = {
  /**
   * Get user settings
   */
  get: async (): Promise<UserSettings> => {
    const response = await apiClient.get('/api/settings');
    return response.data;
  },

  /**
   * Update user settings
   */
  update: async (settings: UserSettings): Promise<{ message: string; settings: UserSettings }> => {
    const response = await apiClient.put('/api/settings', settings);
    return response.data;
  },
};

// =====================================================
// DOCUMENTS API
// =====================================================

export const documentsAPI = {
  /**
   * Get all documents
   */
  getAll: async (): Promise<DocumentsResponse> => {
    const response = await apiClient.get('/api/documents');
    return response.data;
  },

  /**
   * Delete document
   */
  delete: async (documentId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/documents/${documentId}`);
    return response.data;
  },

  /**
   * Set primary document
   */
  setPrimary: async (documentId: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/documents/${documentId}/primary`);
    return response.data;
  },
};

// =====================================================
// MAILBOX API
// =====================================================

export const mailboxAPI = {
  /**
   * Initiate OAuth connection
   */
  connect: async (provider: 'Gmail' | 'Outlook'): Promise<MailboxConnectResponse> => {
    const response = await apiClient.post('/api/Mailbox/connect', null, {
      params: { provider },
    });
    return response.data;
  },

  /**
   * Get mailbox connection status
   */
  getStatus: async (provider?: string): Promise<MailboxStatusResponse> => {
    const response = await apiClient.get('/api/Mailbox/status', {
      params: provider ? { provider } : undefined,
    });
    return response.data;
  },

  /**
   * Disconnect mailbox
   */
  disconnect: async (provider: 'Gmail' | 'Outlook'): Promise<{ message: string }> => {
    const response = await apiClient.delete('/api/Mailbox/disconnect', {
      params: { provider },
    });
    return response.data;
  },
};

// =====================================================
// JOB SOURCES API
// =====================================================

export const jobSourcesAPI = {
  /**
   * Get health status of job sources
   */
  getHealth: async (): Promise<JobSourcesHealthResponse> => {
    const response = await apiClient.get('/api/JobSources/health');
    return response.data;
  },

  /**
   * Get list of available job sources
   */
  getList: async (): Promise<JobSourcesListResponse> => {
    const response = await apiClient.get('/api/JobSources/list');
    return response.data;
  },
};

// =====================================================
// CODELISTS API
// =====================================================

export const codelistsAPI = {
  /**
   * Get position offering types
   */
  getPositionOfferingTypes: async (lastModified?: string): Promise<CodelistResponse> => {
    const response = await apiClient.get('/api/Codelist/position-offering-types', {
      params: lastModified ? { lastModified } : undefined,
    });
    return response.data;
  },

  /**
   * Get occupational series
   */
  getOccupationalSeries: async (lastModified?: string): Promise<CodelistResponse> => {
    const response = await apiClient.get('/api/Codelist/occupational-series', {
      params: lastModified ? { lastModified } : undefined,
    });
    return response.data;
  },

  /**
   * Get hiring paths
   */
  getHiringPaths: async (lastModified?: string): Promise<CodelistResponse> => {
    const response = await apiClient.get('/api/Codelist/hiring-paths', {
      params: lastModified ? { lastModified } : undefined,
    });
    return response.data;
  },

  /**
   * Get geo locations
   */
  getGeoLocations: async (lastModified?: string): Promise<CodelistResponse> => {
    const response = await apiClient.get('/api/Codelist/geo-locations', {
      params: lastModified ? { lastModified } : undefined,
    });
    return response.data;
  },

  /**
   * Get agencies
   */
  getAgencies: async (lastModified?: string): Promise<CodelistResponse> => {
    const response = await apiClient.get('/api/Codelist/agencies', {
      params: lastModified ? { lastModified } : undefined,
    });
    return response.data;
  },
};

// =====================================================
// ADMIN API
// =====================================================

export const adminAPI = {
  /**
   * Get all users (Admin only)
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<AdminUsersResponse> => {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data;
  },

  /**
   * Get analytics overview (Admin only)
   */
  getAnalyticsOverview: async (): Promise<any> => {
    const response = await apiClient.get('/api/admin/analytics/overview');
    return response.data;
  },

  /**
   * Get user analytics (Admin only)
   */
  getUserAnalytics: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/api/admin/analytics/user/${userId}`);
    return response.data;
  },

  /**
   * Get signup analytics (Admin only)
   */
  getSignupAnalytics: async (params?: {
    fromDate?: string;
    toDate?: string;
    groupBy?: string;
  }): Promise<any> => {
    const response = await apiClient.get('/api/admin/analytics/signups', { params });
    return response.data;
  },

  /**
   * Get retention analytics (Admin only)
   */
  getRetentionAnalytics: async (): Promise<any> => {
    const response = await apiClient.get('/api/admin/analytics/retention');
    return response.data;
  },
};

// =====================================================
// LEGACY API COMPATIBILITY (for existing code)
// =====================================================

// Re-export with legacy names for backward compatibility
export const authApi = authAPI;
export const userApi = {
  getProfile: profileAPI.getProfile,
  updateProfile: async (data: any) => {
    // Convert old format to new format
    return profileAPI.updateProfile(data);
  },
};
export const mailboxApi = mailboxAPI;

// Legacy onboarding API (if needed)
export const onboardingApi = {
  submitProfile: async (data: any) => {
    // Map old onboarding format to new profile format
    return profileAPI.updateProfile(data);
  },
  uploadResume: profileAPI.uploadResume,
};

// Info API
export const infoApi = {
  getInfo: async (): Promise<{
    name: string;
    version: string;
    environment: string;
    timestamp: string;
  }> => {
    const response = await apiClient.get('/api/info');
    return response.data;
  },
};

// =====================================================
// EXPORT DEFAULT API OBJECT
// =====================================================

export const api = {
  auth: authAPI,
  profile: profileAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  dashboard: dashboardAPI,
  notifications: notificationsAPI,
  settings: settingsAPI,
  documents: documentsAPI,
  mailbox: mailboxAPI,
  jobSources: jobSourcesAPI,
  codelists: codelistsAPI,
  admin: adminAPI,
};

export default api;

