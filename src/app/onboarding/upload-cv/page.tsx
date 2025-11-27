'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { profileAPI } from '@/lib/api';

export default function UploadCVPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      // Step 1: Upload the CV
      const uploadResponse = await profileAPI.uploadResume(file);
      console.log('CV uploaded successfully:', uploadResponse);

      setUploading(false);
      setParsing(true);

      // Step 2: Poll for profile updates (CV parsing happens in background)
      await pollForProfileUpdate();

      // Step 3: Navigate to profile page with parsed CV data
      router.push('/onboarding/profile');

    } catch (err: any) {
      console.error('Error uploading CV:', err);
      setUploading(false);
      setParsing(false);
      setError(err.response?.data?.message || 'Failed to upload CV. Please try again.');
    }
  };

  // Poll the profile endpoint until CV parsing is complete
  const pollForProfileUpdate = async () => {
    const maxAttempts = 20; // Poll for up to 20 seconds (20 * 1s)
    let attempts = 0;
    
    const poll = async (): Promise<void> => {
      attempts++;
      
      try {
        const profile = await profileAPI.getProfile();
        
        // Check if profile has been populated with CV data
        // (e.g., if fullName or skills are present)
        if (profile.fullName || (profile.skills && profile.skills.length > 0)) {
          console.log('CV parsing complete! Profile updated:', profile);
          setParsing(false);
          return;
        }

        // Continue polling if max attempts not reached
        if (attempts < maxAttempts) {
          setTimeout(() => poll(), 1000); // Poll every 1 second
        } else {
          console.log('Polling timeout - CV may still be parsing');
          setParsing(false);
        }
      } catch (error) {
        console.error('Error polling profile:', error);
        if (attempts < maxAttempts) {
          setTimeout(() => poll(), 1000);
        } else {
          setParsing(false);
        }
      }
    };

    await poll();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your CV</h1>
        <p className="text-gray-600 mb-8">
          Let our AI analyze your CV and auto-fill your profile information
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="mb-4 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading || parsing}
          />
          
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 font-medium">
                📄 {file.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || uploading || parsing}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : parsing ? 'Parsing CV...' : 'Upload CV'}
          </button>

          {parsing && (
            <div className="mt-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-3">
                🤖 Analyzing your CV with AI... This may take a few seconds.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/onboarding/profile')}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
            disabled={uploading || parsing}
          >
            Skip and fill manually →
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Supported formats: PDF, DOC, DOCX • Max size: 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
