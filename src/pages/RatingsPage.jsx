import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star } from 'lucide-react';
import { useUserStore } from '../lib/userStore';
import { getImageUrl } from '../lib/tmdb';

export function RatingsPage() {
  const navigate = useNavigate();
  // Zustand: auto-reactive — re-renders when ratings or comments change
  const getRatingsLibrary = useUserStore(state => state.getRatingsLibrary);
  const _titleRatings = useUserStore(state => state.titleRatings); // trigger re-render
  const _titleComments = useUserStore(state => state.titleComments); // trigger re-render
  const entries = getRatingsLibrary();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Star fill="var(--warning)" color="var(--warning)" size={28} /> Your Ratings & Reviews
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Everything you have rated or reviewed, in one place.</p>
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <Star size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No ratings or reviews yet</h3>
          <p style={{ fontSize: '0.9rem' }}>Open a title and leave a rating or review to build your library.</p>
        </div>
      ) : (
        <div className="trending-grid">
          {entries.map(entry => (
            <article key={`${entry.media_type}_${entry.id}`} onClick={() => navigate(`/dashboard/title/${entry.id}?type=${entry.media_type}`)} style={{ cursor: 'pointer' }}>
              <img
                src={getImageUrl(entry.poster_path, 'w500')}
                alt={entry.title}
                className="poster"
                style={{ aspectRatio: '2/3', width: '100%', objectFit: 'cover', borderRadius: '12px' }}
                onError={(event) => { event.currentTarget.src = getImageUrl(''); }}
              />
              <h2 className="poster-title" style={{ marginTop: '0.75rem', fontSize: '1rem' }}>{entry.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 600, marginTop: '0.35rem' }}>
                <Star size={16} fill="currentColor" />
                {entry.rating ? `${entry.rating}/10` : 'Review only'}
              </div>
              {entry.reviewCount > 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <MessageCircle size={14} /> {entry.reviewCount} {entry.reviewCount === 1 ? 'review' : 'reviews'}
                </div>
              )}
              {entry.latestReview && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.45, marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {entry.latestReview}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
