import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Film, MonitorPlay } from 'lucide-react';
import { useUserStore } from '../lib/userStore';
import { getImageUrl } from '../lib/tmdb';

const formatDate = (timestamp) => timestamp
  ? new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : 'Recently watched';

export function HistoryPage() {
  const navigate = useNavigate();
  // Zustand: auto-reactive — re-renders when watchedItems or watchedEpisodes change
  const getWatchHistory = useUserStore(state => state.getWatchHistory);
  const _watchedItems = useUserStore(state => state.watchedItems); // trigger re-render
  const _watchedEpisodes = useUserStore(state => state.watchedEpisodes); // trigger re-render
  const history = getWatchHistory();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={28} color="var(--accent)" /> Watch History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your most recently watched titles and episodes.</p>
      </div>

      {history.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <Clock size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No watch history yet</h2>
          <p>Mark a movie, series, or episode as watched to start tracking your history.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {history.map((entry, index) => (
            <button
              key={`${entry.media_type}_${entry.id}_${entry.timestamp}_${index}`}
              type="button"
              onClick={() => navigate(`/dashboard/title/${entry.id}?type=${entry.media_type}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}
            >
              <img src={getImageUrl(entry.poster_path, 'w185')} alt={entry.title} style={{ width: 56, height: 80, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{entry.detail}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.45rem' }}>{formatDate(entry.timestamp)}</div>
              </div>
              {entry.media_type === 'movie' ? <Film size={20} color="var(--text-secondary)" /> : <MonitorPlay size={20} color="var(--text-secondary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
