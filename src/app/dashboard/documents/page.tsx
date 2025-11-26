'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Upload, Trash2, Star, Download, 
  Loader2, CheckCircle2, AlertCircle, File
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { 
  useDocuments, 
  useUploadResume, 
  useDeleteDocument, 
  useSetPrimaryDocument 
} from '@/hooks/use-api';
import type { Document } from '@/types';

export default function DocumentsPage() {
  const { data: documentsData, isLoading } = useDocuments();
  const uploadResume = useUploadResume();
  const deleteDocument = useDeleteDocument();
  const setPrimaryDocument = useSetPrimaryDocument();
  
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = documentsData?.documents || [];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setErrorMessage('Only PDF files are allowed');
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB');
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    setUploadStatus('uploading');
    try {
      await uploadResume.mutateAsync(file);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 2000);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Upload failed');
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument.mutateAsync(documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleSetPrimary = async (documentId: string) => {
    try {
      await setPrimaryDocument.mutateAsync(documentId);
    } catch (error) {
      console.error('Failed to set primary document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Documents</h1>
            <p className="text-slate-600 mt-1">Manage your resumes and cover letters</p>
          </div>
          
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === 'uploading'}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {uploadStatus === 'uploading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </motion.div>

        {/* Upload Status Messages */}
        {uploadStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800">Document uploaded successfully!</p>
          </motion.div>
        )}

        {uploadStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-4 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">Upload Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Only PDF files are accepted</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Mark one document as primary to use it for job applications</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-12 text-center">
              <File className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No documents yet</h3>
              <p className="text-slate-600 mb-6">Upload your first resume to get started</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <GlassCard className="p-6 hover:shadow-xl transition-shadow relative">
                  {doc.isPrimary && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-current" />
                        Primary
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate mb-1">
                        {doc.fileName}
                      </h3>
                      <p className="text-sm text-slate-600">{doc.fileType}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-medium">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span className="font-medium">{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!doc.isPrimary && (
                      <Button
                        onClick={() => handleSetPrimary(doc.id)}
                        variant="outline"
                        className="flex-1 gap-2 text-sm"
                      >
                        <Star className="h-3 w-3" />
                        Set Primary
                      </Button>
                    )}
                    {doc.downloadUrl && (
                      <Button
                        onClick={() => window.open(doc.downloadUrl, '_blank')}
                        variant="outline"
                        className="gap-2 text-sm"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(doc.id)}
                      variant="outline"
                      className="gap-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
