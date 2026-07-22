import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';
import { Button } from './Button';

export function TrailerModal({ isOpen, onClose, videoKey, title }) {
  if (!isOpen) return null;

  const youtubeEmbedUrl = videoKey 
    ? `https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0` 
    : null;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent((title || '') + ' official trailer')}`;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#0d0f17',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            <Play size={20} color="var(--accent)" fill="var(--accent)" />
            {title ? `${title} — Official Trailer` : 'Watch Trailer'}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player Box */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          {youtubeEmbedUrl ? (
            <iframe 
              src={youtubeEmbedUrl} 
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Play size={48} color="var(--text-secondary)" />
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Direct Trailer Embed Available</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '450px' }}>
                  TMDB did not return a direct video key for this item. You can watch the trailer on YouTube directly.
                </p>
              </div>
              <a href={youtubeSearchUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="accent" icon={ExternalLink}>
                  Search Trailer on YouTube
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
