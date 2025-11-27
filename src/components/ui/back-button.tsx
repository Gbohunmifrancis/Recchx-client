import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ label = 'Back', fallbackPath = '/dashboard', className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBack}
      className={`gap-2 ${className || ''}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
