'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, AlertCircle, Loader2, Clock, Zap, Briefcase, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJobSourcesHealth, useJobSourcesList } from '@/hooks/use-api';

export default function JobSourcesPage() {
  const { data: healthData, isLoading: healthLoading, refetch } = useJobSourcesHealth();
  const { data: listData, isLoading: listLoading } = useJobSourcesList();

  const isLoading = healthLoading || listLoading;
  const sources = healthData?.sources || [];
  const availableSources = listData?.sources || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-primary';
      case 'degraded':
        return 'text-amber-500';
      case 'unhealthy':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Sources</h1>
            <p className="text-muted-foreground mt-1">Monitor the health of job data providers</p>
          </div>
          
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Refresh Status
          </Button>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sources</p>
                    <p className="text-2xl font-bold text-foreground">{healthData?.totalSources || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Healthy</p>
                    <p className="text-2xl font-bold text-primary">{healthData?.healthySources || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unhealthy</p>
                    <p className="text-2xl font-bold text-destructive">{healthData?.unhealthySources || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground">
                <strong>Status:</strong> {healthData?.summary || 'Checking sources...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last checked: {healthData?.timestamp ? formatDate(healthData.timestamp) : 'Never'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Sources Health */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Active Sources Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{source.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(source.status)}
                        <span className={`font-medium capitalize ${getStatusColor(source.status)}`}>
                          {source.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Jobs Returned</span>
                      </div>
                      <span className="font-semibold text-foreground">{source.jobsReturned}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Response Time</span>
                      </div>
                      <span className="font-semibold text-foreground">{source.responseTimeMs}ms</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Last Checked</span>
                      </div>
                      <span className="font-semibold text-foreground text-xs">
                        {formatDate(source.lastChecked)}
                      </span>
                    </div>

                    {source.errorMessage && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive">
                          <strong>Error:</strong> {source.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Available Sources Info */}
        {availableSources.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Available Job Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableSources.map((source, index) => (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + sources.length + 2) }}
                >
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-2">{source.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Coverage:</span>
                        <span className="text-sm text-foreground">{source.coverage}</span>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-1">Features:</span>
                        <div className="flex flex-wrap gap-2">
                          {source.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
