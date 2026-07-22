import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Check, Clock, Star, Sparkles, Key, ListChecks, Heart } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getTrending, getDetails, getImageUrl, getBackdropUrl } from '../lib/tmdb';
import { supabase } from '../lib/supabase';
import { ApiKeyModal } from '../components/ui/ApiKeyModal';
import { useUserStore } from '../lib/userStore';
import './dashboard.css';

const initialContinueWatching = [
  { id: '106379', type: 'tv', title: 'Fallout', ep: 'S1 E8 - The Beginning', progress: 65, img: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80' },
  { id: '94605', type: 'tv', title: 'Arcane', ep: 'S2 E3 - The Monster You Created', progress: 40, img: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=600&q=80' },
  { id: '693134', type: 'movie', title: 'Dune: Part Two', ep: '2h 46m • 85% watched', progress: 85, img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80' },
];

const statIcons = { hours: Clock, titles: Check, episodes: ListChecks, favorites: Heart };

export function Dashboard() {
  const navigate = useNavigate();
  const [_cwItems, setCwItems] = useState(initialContinueWatching);
  
  // Connect to Zustand store
  const getDashboardData = useUserStore(state => state.getDashboardData);
  const profile = useUserStore(state => state.profile);
  // We subscribe to the store state changes so this component re-renders when needed
  const _watchedItems = useUserStore(state => state.watchedItems);
  const _watchedEpisodes = useUserStore(state => state.watchedEpisodes);
  const _favoriteItems = useUserStore(state => state.favoriteItems);
  
  const activity = getDashboardData();
  
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);

  // React Query for trending data
  const { data: trendingList = [], isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending', 'all', 'week'],
    queryFn: () => getTrending('all', 'week'),
  });

  const loadDashboardData = async () => {
    const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const key = Boolean(session);
    setApiKeySet(key);

    // If API key is present, load real TMDB backdrop/poster images for Continue Watching items
    if (key) {
      const updatedCw = await Promise.all(
        initialContinueWatching.map(async (item) => {
          try {
            const details = await getDetails(item.id, item.type);
            if (details) {
              const bgPath = details.backdrop_path || details.poster_path;
              return {
                ...item,
                title: details.title || details.name || item.title,
                img: bgPath ? getBackdropUrl(bgPath, 'w780') : item.img
              };
            }
          } catch {
            // Keep default fallback
          }
          return item;
        })
      );
      setCwItems(updatedCw);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* API Key Connection Banner if key is missing */}
      {!apiKeySet && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(1, 180, 228, 0.15), rgba(13, 37, 63, 0.3))',
          border: '1px solid rgba(1, 180, 228, 0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#01b4e4', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Key size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Enable Live TMDB Data
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Add your free TMDB API Key to stream live movies, shows, posters, and cast info.
              </div>
            </div>
          </div>
          <Button variant="accent" icon={Sparkles} onClick={() => setIsKeyModalOpen(true)}>
            Connect API Key
          </Button>
        </div>
      )}

      {/* Welcome Section */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>Welcome back, {profile.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening in your entertainment library today.</p>
      </div>

      {/* Continue Watching */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Continue Watching</h2>
          <button type="button" className="section-link" onClick={() => navigate('/dashboard/history')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>View History</button>
        </div>
        {activity.continueWatching.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            Mark a title or episode as watched to see it here.
          </div>
        ) : (
        <div className="continue-watching-grid">
          {activity.continueWatching.map(item => (
            <div key={item.id} className="cw-card" onClick={() => navigate(`/dashboard/title/${item.id}?type=${item.type}`)}>
              <img 
                src={getImageUrl(item.img, 'w780')} 
                alt={item.title} 
                className="cw-bg" 
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="cw-overlay">
                <div className="cw-info">
                  <div className="cw-title">{item.title}</div>
                  <div className="cw-meta">{item.ep}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="cw-hover-actions">
                <Button variant="accent" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                  <Play size={20} />
                </Button>
                <Button variant="secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                  <Check size={20} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Statistics Snapshot */}
      <section>
        <div className="stats-grid">
          {activity.stats.map((stat, idx) => {
            const Icon = statIcons[stat.kind];
            return (
            <Card key={idx} glass className="stat-card">
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </Card>
            );
          })}
        </div>
      </section>

      {/* Trending This Week from TMDB */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Trending This Week (TMDB Live)</h2>
          <a href="#" className="section-link">See All</a>
        </div>

        {isLoadingTrending ? (
          <div className="trending-grid">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%', borderRadius: '12px' }}></div>
                <div className="skeleton" style={{ height: '1rem', marginTop: '0.75rem', width: '80%', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '0.8rem', marginTop: '0.5rem', width: '50%', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="trending-grid">
            {trendingList.map(item => {
              const title = item.title || item.name;
              const type = item.media_type === 'movie' ? 'Movie' : 'Series';
              const date = item.release_date || item.first_air_date;
              const year = date ? date.split('-')[0] : '';
              const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

              return (
                <div 
                  key={item.id} 
                  style={{ cursor: 'pointer', position: 'relative' }} 
                  onClick={() => navigate(`/dashboard/title/${item.id}?type=${item.media_type || 'tv'}`)}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                    <img 
                      src={getImageUrl(item.poster_path, 'w500')} 
                      alt={title} 
                      className="poster" 
                      style={{ aspectRatio: '2/3', width: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#fbbf24',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}>
                      <Star size={12} fill="#fbbf24" /> {rating}
                    </div>
                  </div>
                  <div className="poster-title" style={{ marginTop: '0.5rem', fontWeight: 600 }}>{title}</div>
                  <div className="poster-meta" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {type} {year ? `• ${year}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => loadDashboardData()}
      />
    </div>
  );
}
