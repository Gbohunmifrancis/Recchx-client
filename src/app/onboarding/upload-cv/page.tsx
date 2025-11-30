'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Loader2, ArrowRight } from 'lucide-react';
import { profileAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-card rounded-2xl shadow-xl border border-border p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Your CV</h1>
        <p className="text-muted-foreground mb-8">
          Let our AI analyze your CV and auto-fill your profile information
        </p>
        
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-secondary/30">
          <div className="mb-4">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="mb-4 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
            disabled={uploading || parsing}
          />
          
          {file && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-center gap-2 text-foreground font-medium">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={!file || uploading || parsing}
            variant="primary"
            size="lg"
            className="min-w-[160px]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : parsing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Parsing CV...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload CV
              </>
            )}
          </Button>

          {parsing && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                🤖 Analyzing your CV with AI... This may take a few seconds.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/onboarding/profile')}
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
            disabled={uploading || parsing}
          >
            Skip and fill manually
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Supported formats: PDF, DOC, DOCX • Max size: 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
