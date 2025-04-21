import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface QueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  children: React.ReactNode;
}

/**
 * A component that handles the loading and error states of a query (or async operation)
 * before rendering its children. Displays a full-screen loader or an error message.
 */
export default function QueryBoundary({
  isLoading,
  isError,
  error,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 text-center text-red-600">
        <div>
          <p className="mb-2 text-lg font-semibold">Erreur de chargement</p>
          <p className="text-sm">
            {error?.message || 'Une erreur inconnue est survenue.'}
          </p>
        </div>
      </div>
    );
  }

  // If no loading or error, render the actual content
  return <>{children}</>;
}
