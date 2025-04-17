'use client';

// Import necessary dependencies from TanStack Query and React
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a new QueryClient instance that will be used to manage and cache API requests

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Conditionally render DevTools only in development environment */}
      {/* This provides a UI for debugging queries and monitoring cache state */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
