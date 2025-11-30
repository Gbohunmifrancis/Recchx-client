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
  ProfilePictureUploadResponse,
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
    console.log('Fetching profile from /api/user/profile...');
    const response = await apiClient.get('/api/user/profile');
    console.log('Profile response:', response.data);
    return response.data;
  },

  /**
   * Create or update user profile
   * POST /api/user/profile
   */
  updateProfile: async (data: ProfileData): Promise<{ success?: boolean; profileId?: string; message?: string; profile?: ProfileResponse }> => {
    // Clean up data before sending - remove any undefined values
    const cleanData: ProfileData = {
      fullName: data.fullName || undefined,
      phoneNumber: data.phoneNumber || undefined,
      address: data.address || undefined,
      linkedInUrl: data.linkedInUrl || undefined,
      githubUrl: data.githubUrl || undefined,
      portfolioUrl: data.portfolioUrl || undefined,
      professionalSummary: data.professionalSummary || undefined,
      yearsOfExperience: data.yearsOfExperience !== undefined ? data.yearsOfExperience : undefined,
      currentRole: data.currentRole || undefined,
      skills: data.skills && data.skills.length > 0 ? data.skills : undefined,
      desiredJobTitles: data.desiredJobTitles && data.desiredJobTitles.length > 0 ? data.desiredJobTitles : undefined,
      preferredJobTypes: data.preferredJobTypes && data.preferredJobTypes.length > 0 ? data.preferredJobTypes : undefined,
      preferredLocations: data.preferredLocations && data.preferredLocations.length > 0 ? data.preferredLocations : undefined,
      expectedSalaryRange: data.expectedSalaryRange || undefined,
      willingToRelocate: data.willingToRelocate,
    };
    
    // Remove undefined keys
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key as keyof ProfileData] === undefined) {
        delete cleanData[key as keyof ProfileData];
      }
    });
    
    const response = await apiClient.post('/api/user/profile', cleanData);
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

  /**
   * Upload profile picture
   * POST /api/user/profile-picture
   * Supports: JPG, PNG, GIF, WebP (max 5MB)
   */
  uploadProfilePicture: async (file: File): Promise<ProfilePictureUploadResponse> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/user/profile-picture', formData, {
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

  /**
   * Save a job for later
   */
  saveJob: async (jobId: string): Promise<{ message: string; savedAt: string }> => {
    const response = await apiClient.post(`/api/jobs/${jobId}/save`);
    return response.data;
  },

  /**
   * Remove a job from saved jobs
   */
  unsaveJob: async (jobId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/jobs/${jobId}/unsave`);
    return response.data;
  },

  /**
   * Get all saved jobs
   */
  getSavedJobs: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<import('@/types').SavedJobsResponse> => {
    const response = await apiClient.get('/api/jobs/saved', { params });
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

  /**
   * Add a note to an application
   */
  addNote: async (
    applicationId: string,
    data: import('@/types').AddApplicationNoteRequest
  ): Promise<{ noteId: string; message: string; createdAt: string }> => {
    const response = await apiClient.post(`/api/applications/${applicationId}/notes`, data);
    return response.data;
  },

  /**
   * Get application activity timeline
   */
  getActivity: async (applicationId: string): Promise<import('@/types').ApplicationActivitiesResponse> => {
    const response = await apiClient.get(`/api/applications/${applicationId}/activity`);
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
// COMPANY API
// =====================================================

export const companyAPI = {
  /**
   * Get company details by ID
   */
  getDetails: async (companyId: string): Promise<import('@/types').CompanyDetailsResponse> => {
    const response = await apiClient.get(`/api/companies/${companyId}`);
    return response.data;
  },

  /**
   * Add a note about a company
   */
  addNote: async (
    companyId: string,
    data: import('@/types').AddCompanyNoteRequest
  ): Promise<{ noteId: string; message: string }> => {
    const response = await apiClient.post(`/api/companies/${companyId}/notes`, data);
    return response.data;
  },

  /**
   * Follow a company to get updates about new job postings
   */
  follow: async (companyId: string): Promise<{ message: string; followedAt: string }> => {
    const response = await apiClient.post(`/api/companies/${companyId}/follow`);
    return response.data;
  },

  /**
   * Unfollow a company
   */
  unfollow: async (companyId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/companies/${companyId}/follow`);
    return response.data;
  },

  /**
   * Get all followed companies
   */
  getFollowed: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<import('@/types').FollowedCompaniesResponse> => {
    const response = await apiClient.get('/api/companies/followed', { params });
    return response.data;
  },
};

// =====================================================
// INTERVIEW API
// =====================================================

export const interviewAPI = {
  /**
   * Schedule an interview for an application
   */
  schedule: async (
    applicationId: string,
    data: import('@/types').ScheduleInterviewRequest
  ): Promise<{ interviewId: string; scheduledDate: string; message: string }> => {
    const response = await apiClient.post(`/api/applications/${applicationId}/interviews`, data);
    return response.data;
  },

  /**
   * Get all interviews
   */
  getAll: async (params?: import('@/types').InterviewParams): Promise<import('@/types').InterviewsResponse> => {
    const response = await apiClient.get('/api/interviews', { params });
    return response.data;
  },

  /**
   * Update interview details
   */
  update: async (
    interviewId: string,
    data: import('@/types').UpdateInterviewRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/interviews/${interviewId}`, data);
    return response.data;
  },

  /**
   * Delete an interview
   */
  delete: async (interviewId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/interviews/${interviewId}`);
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
   * Check if current user is an admin
   */
  checkAdminStatus: async (): Promise<import('@/types').AdminCheckResponse> => {
    const response = await apiClient.get('/api/admin/check-admin');
    return response.data;
  },

  /**
   * Get all users (Admin only)
   */
  getUsers: async (params?: import('@/types').AdminUsersParams): Promise<any> => {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data;
  },

  /**
   * Get user sessions by user ID (Admin only)
   */
  getUserSessions: async (userId: string): Promise<import('@/types').UserSessionsResponse> => {
    const response = await apiClient.get(`/api/admin/users/${userId}/sessions`);
    return response.data;
  },

  /**
   * Get all active sessions (Admin only)
   */
  getAllSessions: async (params?: import('@/types').AllSessionsParams): Promise<import('@/types').AllSessionsResponse> => {
    const response = await apiClient.get('/api/admin/sessions', { params });
    return response.data;
  },

  /**
   * Get analytics overview (Admin only)
   */
  getAnalyticsOverview: async (): Promise<import('@/types').AnalyticsOverview> => {
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
  company: companyAPI,
  interview: interviewAPI,
  admin: adminAPI,
};

export default api;

