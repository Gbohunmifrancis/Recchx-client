'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = searchParams.get('provider');

  useEffect(() => {
    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'oauth-success',
          provider: provider,
        },
        window.location.origin
      );
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      // If not in popup, redirect to onboarding
      setTimeout(() => {
        router.push('/onboarding');
      }, 500);
    }
  }, [provider, router]);

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="glass-card p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Successfully Connected!
        </h1>
        <p className="text-slate-600">
          Your {provider} account has been connected.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Closing window...</span>
        </div>
      </div>
    </div>
  );
}
