'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to prevent browser back navigation after logout
 * When a user logs out, this hook ensures they can't navigate back to protected pages
 */
export function useNavigationGuard(isAuthenticated: boolean) {
  const router = useRouter();

  useEffect(() => {
    // Add a state to history when component mounts
    if (isAuthenticated) {
      window.history.pushState(null, '', window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      // If user is not authenticated and tries to go back, redirect to auth
      if (!isAuthenticated) {
        window.history.pushState(null, '', window.location.href);
        router.push('/auth');
      } else {
        // For authenticated users, allow normal back navigation
        // but prevent going back to auth page
        const currentPath = window.location.pathname;
        if (currentPath === '/auth' || currentPath === '/') {
          event.preventDefault();
          window.history.pushState(null, '', '/dashboard');
          router.push('/dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, router]);
}

/**
 * Hook specifically for logout back button prevention
 * Use this in the dashboard or protected pages
 */
export function usePreventBackAfterLogout() {
  useEffect(() => {
    // Push a new state when component mounts
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Check if user is still authenticated
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        // User is not authenticated, prevent back navigation
        window.history.pushState(null, '', '/auth');
        window.location.href = '/auth';
      } else {
        // User is authenticated, push state again to maintain guard
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}
