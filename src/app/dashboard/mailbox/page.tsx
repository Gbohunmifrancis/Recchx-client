'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, CheckCircle2, XCircle, RefreshCw, 
  Loader2, AlertCircle, Calendar, Link as LinkIcon
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Email Integration</h1>
            <p className="text-slate-600 mt-1">Connect your email to track job applications</p>
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
          <GlassCard className="p-4 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">Why connect your email?</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Automatically track application responses</li>
                  <li>Get notified about interview invitations</li>
                  <li>Keep all job communications in one place</li>
                  <li>Your credentials are securely encrypted</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Gmail Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gmail</h2>
                  <p className="text-sm text-slate-600">Connect your Google account</p>
                </div>
              </div>
              
              {gmailConnection?.isActive ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Not Connected</span>
                </div>
              )}
            </div>

            {gmailConnection?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">{gmailConnection.email}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Connected: {formatDate(gmailConnection.connectedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-slate-500" />
                      <span>Last Sync: {formatDate(gmailConnection.lastSyncAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDisconnect('Gmail')}
                  variant="outline"
                  className="w-full gap-2 text-red-600 hover:bg-red-50"
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
                className="w-full gap-2 bg-gradient-to-r from-red-500 to-pink-500"
                disabled={connectMailbox.isPending}
              >
                {connectMailbox.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Connect Gmail
              </Button>
            )}
          </GlassCard>
        </motion.div>

        {/* Outlook Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Outlook</h2>
                  <p className="text-sm text-slate-600">Connect your Microsoft account</p>
                </div>
              </div>
              
              {outlookConnection?.isActive ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Not Connected</span>
                </div>
              )}
            </div>

            {outlookConnection?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">{outlookConnection.email}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Connected: {formatDate(outlookConnection.connectedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-slate-500" />
                      <span>Last Sync: {formatDate(outlookConnection.lastSyncAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDisconnect('Outlook')}
                  variant="outline"
                  className="w-full gap-2 text-red-600 hover:bg-red-50"
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
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
                disabled={connectMailbox.isPending}
              >
                {connectMailbox.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Connect Outlook
              </Button>
            )}
          </GlassCard>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-4 bg-slate-50/50">
            <div className="text-xs text-slate-600 text-center">
              <p className="mb-1">🔒 Your privacy is our priority</p>
              <p>
                We use OAuth 2.0 for secure authentication. We never store your password and 
                only access emails related to your job search with your explicit permission.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
