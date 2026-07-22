import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
      <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Something went wrong.</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{error.message}</p>
      <button 
        onClick={() => {
          localStorage.clear();
          resetErrorBoundary();
          window.location.reload();
        }}
        style={{
          background: 'var(--accent)', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
          borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginRight: '1rem'
        }}
      >
        Clear Data & Reload
      </button>
      <button 
        onClick={resetErrorBoundary}
        style={{
          background: 'var(--surface-light)', color: 'var(--text-primary)', border: 'none', padding: '0.75rem 1.5rem',
          borderRadius: '8px', cursor: 'pointer', fontWeight: 600
        }}
      >
        Try Again
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <App />
        </HashRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
