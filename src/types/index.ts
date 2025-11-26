// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Standard';
  avatar?: string;
}

export interface UserProfile {
  userId: string;
  professionalSummary?: string;
  skills: string[];
  preferences: Record<string, any>;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Campaign Types
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Paused';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  scheduledDate?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStep {
  id: string;
  campaignId: string;
  stepNumber: number;
  type: 'Email' | 'Wait' | 'FollowUp';
  delayDays?: number;
  subject?: string;
  body?: string;
}

// Prospect Types
export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size?: string;
  location?: string;
  contacts: Contact[];
}

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  verified: boolean;
  phoneNumber?: string;
  linkedinUrl?: string;
}

// Mailbox Types
export interface MailboxMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  campaignId?: string;
  contactId?: string;
  isRead: boolean;
  status: 'Interested' | 'NotInterested' | 'Pending' | 'Snoozed';
}

// UserCompanyMatch (for Dashboard Recent Activity)
export interface UserCompanyMatch {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  matchedAt: string;
  score: number;
  status: 'New' | 'InProgress' | 'Contacted' | 'Responded';
}

// =====================================================
// NEW API TYPES FROM BACKEND
// =====================================================

// Auth Types
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  token?: string; // Backend returns 'token'
  accessToken?: string; // Some endpoints might return 'accessToken'
  refreshToken: string;
  expiresAt?: string;
  sessionId?: string;
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// User Profile Types
export interface ProfileData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  professionalSummary?: string;
  yearsOfExperience?: number;
  currentRole?: string;
  skills?: string[];
  desiredJobTitles?: string[];
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  expectedSalaryRange?: string;
  willingToRelocate?: boolean;
}

export interface ProfileResponse extends ProfileData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeUploadResponse {
  message: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedDate: string;
  expiryDate?: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  contactEmail?: string;
  applicationUrl?: string;
  matchScore?: number;
  matchReasons?: string[];
  isApplied: boolean;
  isSaved?: boolean;
  applicationStatus?: string | null;
  appliedDate?: string | null;
}

export interface JobMatchParams {
  page?: number;
  limit?: number;
  sortBy?: 'matchScore' | 'postedDate' | 'salary';
  minMatchScore?: number;
  jobType?: string;
  location?: string;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  jobType?: string;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}

export interface JobMatchesResponse {
  jobs: Job[];
  pagination: Pagination;
}

export interface JobSearchResponse {
  jobs: Job[];
  pagination: Pagination;
  sources?: {
    [key: string]: {
      jobs: number;
      responseTime: number;
    };
  };
}

export interface ApplyToJobData {
  coverLetter?: string;
  resumeId?: string;
}

export interface ApplyToJobResponse {
  message: string;
  applicationId: string;
  appliedAt: string;
}

// Application Types
export interface TimelineEvent {
  status: string;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location?: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate: string;
  lastUpdated: string;
  coverLetter?: string;
  resumeUsed?: {
    id: string;
    fileName: string;
  };
  timeline: TimelineEvent[];
  notes?: string;
}

export interface ApplicationParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination: Pagination;
  statusSummary?: {
    pending: number;
    reviewing: number;
    interview: number;
    offered: number;
    rejected: number;
    accepted: number;
    withdrawn: number;
  };
}

export interface UpdateApplicationRequest {
  status: string;
  note?: string;
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalJobMatches: number;
  applicationsSubmitted: number;
  topMatchScore: number;
  mailboxConnected: boolean;
  mailboxType: string | null;
  lastMailboxSync: string | null;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  weeklyStats: {
    newMatches: number;
    applications: number;
    responses: number;
  };
}

// Legacy Dashboard Stats (for backward compatibility)
export interface LegacyDashboardStats {
  applications: {
    total: number;
    pending: number;
    reviewing: number;
    interview: number;
    offered: number;
    rejected: number;
    accepted: number;
  };
  jobMatches: {
    total: number;
    newToday: number;
    highMatch: number;
  };
  profile: {
    completeness: number;
    missingFields: string[];
  };
  activity: {
    appliedLastWeek: number;
    viewedLastWeek: number;
  };
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedDate: string;
  }>;
  upcomingInterviews: Array<{
    applicationId: string;
    jobTitle: string;
    company: string;
    scheduledDate: string;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean; // Changed from isRead to match API
  isRead: boolean; // Keep for backward compatibility
  createdAt: string;
  data?: Record<string, any>;
}

export interface NotificationParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: Pagination;
  unreadCount: number;
}

// Settings Types
export interface UserSettings {
  notifications: {
    email?: {
      jobMatches?: boolean;
      applicationUpdates?: boolean;
      weeklyDigest?: boolean;
    };
    push?: {
      jobMatches?: boolean;
      applicationUpdates?: boolean;
    };
    emailNotifications?: boolean;
    newMatchAlerts?: boolean;
    weeklyDigest?: boolean;
  };
  privacy: {
    profileVisible?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    profileVisibility?: string;
  };
  preferences: {
    language?: string;
    timezone?: string;
    emailFrequency?: string;
    theme?: string;
  };
}

// Document Types
export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  isPrimary: boolean;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface DocumentsResponse {
  documents: Document[];
}

// Mailbox Types
export interface MailboxConnection {
  id: string;
  provider: 'Gmail' | 'Outlook';
  email: string;
  isActive: boolean;
  connectedAt: string;
  lastSyncAt?: string;
}

export interface MailboxConnectResponse {
  authorizationUrl: string;
  state: string;
}

export interface MailboxStatusResponse {
  connections: MailboxConnection[];
}

// Job Sources Types
export interface JobSourceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  jobsReturned: number;
  responseTimeMs: number;
  errorMessage: string | null;
  lastChecked: string;
}

export interface JobSourcesHealthResponse {
  timestamp: string;
  totalSources: number;
  healthySources: number;
  unhealthySources: number;
  sources: JobSourceHealth[];
  summary: string;
}

export interface JobSource {
  name: string;
  description: string;
  coverage: string;
  features: string[];
}

export interface JobSourcesListResponse {
  totalSources: number;
  sources: JobSource[];
}

// Codelist Types
export interface Code {
  code: string;
  name: string;
}

export interface CodelistResponse {
  codes?: Code[];
  series?: Code[];
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  applicationCount?: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

// Pagination Type
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalJobs?: number;
  totalApplications?: number;
  totalNotifications?: number;
  totalUsers?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Campaign Dashboard Stats (for campaign/prospect tracking)
export interface CampaignDashboardStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  replies: number;
  activeCampaigns: number;
  totalProspects: number;
  unreadMessages: number;
}
