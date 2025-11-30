'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, XCircle, RefreshCw, 
  Loader2, AlertCircle, Calendar, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GmailIcon, OutlookIcon } from '@/components/icons/brand-icons';
import { 
  useMailboxStatus, 
  useConnectMailbox, 
  useDisconnectMailbox 
} from '@/hooks/use-api';
import type { MailboxConnection } from '@/types';

export default function MailboxPage() {
  const { data: statusData, isLoading, refetch } = useMailboxStatus();
  const connectMailbox = useConnectMailbox();
  const disconnectMailbox = useDisconnectMailbox();

  const connections = statusData?.connections || [];

  const handleConnect = async (provider: 'Gmail' | 'Outlook') => {
    try {
      await connectMailbox.mutateAsync(provider);
      // OAuth redirect will happen in the mutation
    } catch (error) {
      console.error('Failed to connect mailbox:', error);
    }
  };

  const handleDisconnect = async (provider: 'Gmail' | 'Outlook') => {
    if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) return;
    
    try {
      await disconnectMailbox.mutateAsync(provider);
      refetch();
    } catch (error) {
      console.error('Failed to disconnect mailbox:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConnection = (provider: 'Gmail' | 'Outlook'): MailboxConnection | undefined => {
    return connections.find(conn => conn.provider === provider);
  };

  const gmailConnection = getConnection('Gmail');
  const outlookConnection = getConnection('Outlook');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Email Integration</h1>
            <p className="text-muted-foreground mt-1">Connect your email to track job applications</p>
          </div>
          
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Why connect your email?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Automatically track application responses</li>
                  <li>Get notified about interview invitations</li>
                  <li>Keep all job communications in one place</li>
                  <li>Your credentials are securely encrypted</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gmail Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 border border-border flex items-center justify-center">
                  <GmailIcon size={40} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Gmail</h2>
                  <p className="text-sm text-muted-foreground">Connect your Google account</p>
                </div>
              </div>
              
              {gmailConnection?.isActive ? (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Not Connected</span>
                </div>
              )}
            </div>

            {gmailConnection?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <GmailIcon size={20} />
                    <span className="font-medium text-foreground">{gmailConnection.email}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Connected: {formatDate(gmailConnection.connectedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Last Sync: {formatDate(gmailConnection.lastSyncAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDisconnect('Gmail')}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={disconnectMailbox.isPending}
                >
                  {disconnectMailbox.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Disconnect Gmail
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleConnect('Gmail')}
                className="w-full gap-2"
                disabled={connectMailbox.isPending}
              >
                {connectMailbox.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GmailIcon size={18} />
                )}
                Connect Gmail
              </Button>
            )}
          </div>
        </motion.div>

        {/* Outlook Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 border border-border flex items-center justify-center">
                  <OutlookIcon size={40} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Outlook</h2>
                  <p className="text-sm text-muted-foreground">Connect your Microsoft account</p>
                </div>
              </div>
              
              {outlookConnection?.isActive ? (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Not Connected</span>
                </div>
              )}
            </div>

            {outlookConnection?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <OutlookIcon size={20} />
                    <span className="font-medium text-foreground">{outlookConnection.email}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Connected: {formatDate(outlookConnection.connectedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Last Sync: {formatDate(outlookConnection.lastSyncAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDisconnect('Outlook')}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={disconnectMailbox.isPending}
                >
                  {disconnectMailbox.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Disconnect Outlook
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleConnect('Outlook')}
                className="w-full gap-2"
                disabled={connectMailbox.isPending}
              >
                {connectMailbox.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <OutlookIcon size={18} />
                )}
                Connect Outlook
              </Button>
            )}
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-xs text-muted-foreground text-center">
              <p className="mb-1">🔒 Your privacy is our priority</p>
              <p>
                We use OAuth 2.0 for secure authentication. We never store your password and 
                only access emails related to your job search with your explicit permission.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
