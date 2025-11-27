'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import type { LoginData, SignUpData, ProfileResponse } from '@/types';

interface AuthContextType {
  user: ProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      
      // Backend returns 'token' not 'accessToken'
      const accessToken = response.token || response.accessToken;
      const refreshToken = response.refreshToken;
      
      if (!accessToken) {
        throw new Error('No access token received from login');
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch full user profile after login
      let fullProfile: ProfileResponse | null = null;
      try {
        fullProfile = await authAPI.getMe();
        setUser(fullProfile);
      } catch (profileError) {
        // Fallback to response data if getMe fails
        const userData = {
          userId: response.userId || response.user?.userId,
          firstName: response.firstName || response.user?.firstName,
          lastName: response.lastName || response.user?.lastName,
          email: response.email || response.user?.email,
        } as ProfileResponse;
        setUser(userData);
        fullProfile = userData;
      }
      
      // Small delay to ensure localStorage is synced before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if profile is complete - only check if onboarding was actually completed
      const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
      const isProfileComplete = fullProfile && (
        fullProfile.professionalSummary &&
        fullProfile.skills && fullProfile.skills.length > 0 &&
        fullProfile.desiredJobTitles && fullProfile.desiredJobTitles.length > 0
      );
      
      // If onboarding was completed before, always go to dashboard
      if (onboardingCompleted || isProfileComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: SignUpData) => {
    try {
      const response = await authAPI.signUp(data);
      
      // Backend returns 'token' not 'accessToken'
      const accessToken = response.token || response.accessToken;
      const refreshToken = response.refreshToken;
      
      if (!accessToken) {
        throw new Error('No access token received from signup');
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Mark as new user for onboarding flow
      localStorage.setItem('isNewUser', 'true');
      
      // Fetch full user profile after signup
      try {
        const fullProfile = await authAPI.getMe();
        setUser(fullProfile);
      } catch (profileError) {
        // Fallback to response data if getMe fails
        const userData = {
          userId: response.userId || response.user?.userId,
          firstName: response.firstName || response.user?.firstName,
          lastName: response.lastName || response.user?.lastName,
          email: response.email || response.user?.email,
        } as ProfileResponse;
        setUser(userData);
      }
      
      // Small delay to ensure localStorage is synced before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // New users go to CV upload first
      router.push('/onboarding/upload-cv');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Silent error handling
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isNewUser');
      setUser(null);
      router.push('/auth');
    }
  };

  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      // Silent error handling
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isNewUser');
      setUser(null);
      router.push('/auth');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      // Silent error handling
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        logoutAll,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
