'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { mailboxApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GmailIcon, OutlookIcon } from '@/components/icons/brand-icons';

export default function MailboxSetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  const [gmailStatus, setGmailStatus] = React.useState<{ connected: boolean; email?: string } | null>({ connected: false });
  const [outlookStatus, setOutlookStatus] = React.useState<{ connected: boolean; email?: string } | null>({ connected: false });
  const [loading, setLoading] = React.useState(false);
  const [comingFromDashboard, setComingFromDashboard] = React.useState(false);

  React.useEffect(() => {
    // Check if user came from dashboard
    const fromDashboard = sessionStorage.getItem('fromDashboard');
    if (fromDashboard) {
      setComingFromDashboard(true);
      sessionStorage.removeItem('fromDashboard');
    }
  }, []);

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    setConnecting(provider);
    setError('');

    try {
      // Capitalize provider name for API: gmail -> Gmail, outlook -> Outlook
      const capitalizedProvider = (provider.charAt(0).toUpperCase() + provider.slice(1)) as 'Gmail' | 'Outlook';
      const response = await mailboxApi.connect(capitalizedProvider);
      
      if (response.authorizationUrl) {
        // Open OAuth in popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          response.authorizationUrl,
          'OAuth Authorization',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
        );

        // Listen for OAuth callback
        const handleMessage = (event: MessageEvent) => {
          
          if (event.origin !== window.location.origin) {
            return;
          }
          
          if (event.data.type === 'oauth-success') {
            window.removeEventListener('message', handleMessage);
            setConnecting(null);
            // Redirect based on where user came from
            setTimeout(() => {
              if (comingFromDashboard) {
                router.push('/dashboard');
              } else {
                router.push('/onboarding');
              }
            }, 100);
          } else if (event.data.type === 'oauth-error') {
            window.removeEventListener('message', handleMessage);
            setError(event.data.message || 'Failed to connect mailbox');
            setConnecting(null);
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was blocked
        if (!popup || popup.closed) {
          setError('Popup was blocked. Please allow popups and try again.');
          setConnecting(null);
          window.removeEventListener('message', handleMessage);
          return;
        }

        // Poll popup status - if it closes, assume success and redirect
        const checkPopupClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopupClosed);
            window.removeEventListener('message', handleMessage);
            setConnecting(null);
            setTimeout(() => {
              if (comingFromDashboard) {
                router.push('/dashboard');
              } else {
                router.push('/onboarding');
              }
            }, 500);
          }
        }, 500);
      } else {
        setError('No authorization URL received from server');
        setConnecting(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.detail || err.message || `Failed to connect ${provider}. Please try again.`);
      setConnecting(null);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding');
  };

  const handleContinue = () => {
    if (gmailStatus?.connected || outlookStatus?.connected) {
      router.push('/onboarding');
    }
  };

  const isAnyConnected = gmailStatus?.connected || outlookStatus?.connected;

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        <GlassCard variant="strong" className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
            >
              <GmailIcon size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-800">
              Connect Your Mailbox
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Connect your email account to start sending personalized outreach campaigns
            </p>
          </div>

          {/* Welcome Message */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-slate-700">
                Welcome, <span className="font-semibold">{user.firstName}!</span>
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Mailbox Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gmail */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassCard className="p-6 hover:bg-white/60 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-md">
                            <GmailIcon size={32} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">Gmail</h3>
                            <p className="text-xs text-slate-600">Google Workspace</p>
                          </div>
                        </div>
                        {gmailStatus?.connected && (
                          <CheckCircle className="h-6 w-6 text-emerald-500" />
                        )}
                      </div>

                      {gmailStatus?.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                            <CheckCircle className="h-4 w-4" />
                            <span>Connected</span>
                          </div>
                          {gmailStatus.email && (
                            <p className="text-xs text-slate-600">{gmailStatus.email}</p>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => handleConnect('gmail')}
                          disabled={connecting !== null}
                        >
                          {connecting === 'gmail' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <GmailIcon size={18} />
                              Connect Gmail
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Outlook */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GlassCard className="p-6 hover:bg-white/60 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-md">
                            <OutlookIcon size={32} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">Outlook</h3>
                            <p className="text-xs text-slate-600">Microsoft 365</p>
                          </div>
                        </div>
                        {outlookStatus?.connected && (
                          <CheckCircle className="h-6 w-6 text-emerald-500" />
                        )}
                      </div>

                      {outlookStatus?.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                            <CheckCircle className="h-4 w-4" />
                            <span>Connected</span>
                          </div>
                          {outlookStatus.email && (
                            <p className="text-xs text-slate-600">{outlookStatus.email}</p>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => handleConnect('outlook')}
                          disabled={connecting !== null}
                        >
                          {connecting === 'outlook' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <OutlookIcon size={18} />
                              Connect Outlook
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-4"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <GmailIcon size={18} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-slate-800 text-sm">Why connect your mailbox?</h4>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>Send personalized outreach campaigns</li>
                      <li>Track email opens and responses</li>
                      <li>Automate follow-up sequences</li>
                      <li>Manage all conversations in one place</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleSkip}
                  className="flex-1"
                  disabled={connecting !== null}
                >
                  Skip for now
                </Button>
                {isAnyConnected && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleContinue}
                    className="flex-1"
                  >
                    Continue to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
              </motion.div>
            </>
          )}
        </GlassCard>

        {/* Footer Note */}
        <p className="text-center mt-4 text-sm text-slate-600">
          Your credentials are encrypted and secure. We never store your password.
        </p>
      </motion.div>
    </div>
  );
}