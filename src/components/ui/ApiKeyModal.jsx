import React from 'react';
import { Key, X } from 'lucide-react';
import { Button } from './Button';

export function ApiKeyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #01b4e4, #0d253f)',
            padding: '10px',
            borderRadius: '12px',
            color: 'white',
            display: 'flex'
          }}>
            <Key size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Secure TMDB data</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Live TMDB requests are handled securely by the app server.
            </p>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Sign in to your TrackerPro account to access live TMDB content. Your TMDB API key is never stored in this browser.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button type="button" variant="secondary" onClick={onClose}>Close</Button></div>
      </div>
    </div>
  );
}
