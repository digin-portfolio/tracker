import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useUserStore } from '../lib/userStore';
import { getImageUrl } from '../lib/tmdb';

export function FavoritesPage() {
  const navigate = useNavigate();
  // Zustand: subscribe to favoriteItems — re-renders automatically on change
  const favoriteItems = useUserStore(state => state.favoriteItems);
  const toggleFavorite = useUserStore(state => state.toggleFavorite);
  const favorites = Object.values(favoriteItems);

  const handleRemove = (e, id) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Heart fill="#f43f5e" color="#f43f5e" size={28} /> Your Favorites
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Shows and movies you saved as your all-time favorites.</p>
      </div>

      {favorites.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <Heart size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No favorites added yet</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Browse any movie or TV show title page and click the <b>Favorite</b> button to save them here!
          </p>
        </div>
      ) : (
        <div className="trending-grid">
          {favorites.map(item => (
            <div 
              key={item.id} 
              style={{ cursor: 'pointer', position: 'relative' }} 
              onClick={() => navigate(`/dashboard/title/${item.id}?type=${item.media_type}`)}
            >
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                <img 
                  src={getImageUrl(item.poster_path, 'w500')} 
                  alt={item.title} 
                  className="poster" 
                  style={{ aspectRatio: '2/3', width: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <button 
                  onClick={(e) => handleRemove(e, item.id)}
                  title="Remove from Favorites"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    color: '#f43f5e',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="poster-title" style={{ marginTop: '0.5rem', fontWeight: 600 }}>{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
