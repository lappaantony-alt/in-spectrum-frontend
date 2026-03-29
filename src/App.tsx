import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthProvider';
import { queryClient } from './lib/queryClient';
import { router } from './router';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2D2D2D',
              color: '#FFFFFF',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              padding: '0.75rem 1rem',
            },
            success: {
              iconTheme: {
                primary: '#4CAF82',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
