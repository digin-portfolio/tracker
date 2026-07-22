import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Heart, Clock, Play, Check, MessageCircle, Calendar, Users, Loader2, BookmarkCheck, CheckCircle2, ListPlus, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CommentSection } from '../components/ui/CommentSection';
import { RatingWidget } from '../components/ui/RatingWidget';
import { TrailerModal } from '../components/ui/TrailerModal';
import { getDetails, getSeasonDetails, getImageUrl, getBackdropUrl } from '../lib/tmdb';
import { useUserStore } from '../lib/userStore';
import { useCollectionStore } from '../lib/collectionStore';
import './title.css';

export function TitlePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mediaType = searchParams.get('type') || 'tv';
  const titleKey = `${mediaType}_${id}`;

  const [userRating, setUserRating] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isCollectionPickerOpen, setIsCollectionPickerOpen] = useState(false);

  // Zustand stores
  const getCollections = useCollectionStore(state => state.getCollections);
  const collections = getCollections();
  const addCollectionItem = useCollectionStore(state => state.addCollectionItem);

  const isWatched = useUserStore(state => state.isWatched);
  const toggleWatched = useUserStore(state => state.toggleWatched);
  const isFavorite = useUserStore(state => state.isFavorite);
  const toggleFavorite = useUserStore(state => state.toggleFavorite);
  const isEpisodeWatched = useUserStore(state => state.isEpisodeWatched);
  const toggleEpisodeWatched = useUserStore(state => state.toggleEpisodeWatched);
  const getUserRating = useUserStore(state => state.getUserRating);
  const persistUserRating = useUserStore(state => state.setUserRating);

  // Watched & Favorite States are now derived straight from the store instead of useEffect
  const watched = isWatched(id);
  const favorited = isFavorite(id);
  
  // We can still use local state for toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const { data, isLoading: loading } = useQuery({
    queryKey: ['titleDetails', mediaType, id],
    queryFn: () => getDetails(id, mediaType),
    staleTime: 5 * 60 * 1000,
  });

  // Default to season 1 or the first valid season once data loads
  useEffect(() => {
    if (data && mediaType === 'tv' && data.seasons && data.seasons.length > 0) {
      const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
      if (firstSeason && selectedSeason === 1) { // Only set if selectedSeason hasn't been changed
        setSelectedSeason(firstSeason.season_number);
      }
    }
  }, [data, mediaType, selectedSeason]);

  const { data: seasonData, isLoading: loadingSeason } = useQuery({
    queryKey: ['seasonDetails', id, selectedSeason],
    queryFn: () => getSeasonDetails(id, selectedSeason),
    enabled: !!data && mediaType === 'tv',
    staleTime: 5 * 60 * 1000,
  });

  // We no longer need useEffect to set watched/favorited or refresh collections, 
  // as Zustand's reactivity handles it, but we do need it to set initial userRating 
  // into our local state if we want to manage it locally before persisting, 
  // or we can just derive it. Let's use local state for the rating widget.
  useEffect(() => {
    setUserRating(getUserRating(titleKey));
  }, [id, titleKey, getUserRating]);

  const handleRating = (rating) => {
    setUserRating(rating);
    persistUserRating(titleKey, rating, {
      title: data?.title || data?.name,
      poster_path: data?.poster_path,
      media_type: mediaType
    });
  };

  const handleAddToCollection = (collectionId) => {
    addCollectionItem(collectionId, {
      title: data.title || data.name || 'Untitled',
      year: (data.release_date || data.first_air_date || '').split('-')[0],
      media_type: mediaType,
      poster_path: data.poster_path || ''
    });
    const collection = collections.find(item => item.id === collectionId);
    setIsCollectionPickerOpen(false);
    showToast(`Added "${data.title || data.name}" to ${collection?.title || 'your collection'}`, 'success');
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleToggleWatched = () => {
    if (!data) return;
    const titleStr = data.title || data.name || 'Title';
    const newState = toggleWatched(id, {
      title: titleStr,
      poster_path: data.poster_path,
      media_type: mediaType
    });
    // watched/favorited are now derived from Zustand — no local setState needed
    showToast(newState ? `"${titleStr}" marked as Watched` : `"${titleStr}" removed from Watched`, newState ? 'success' : 'info');
  };

  const handleToggleFavorite = () => {
    if (!data) return;
    const titleStr = data.title || data.name || 'Title';
    const newState = toggleFavorite(id, {
      title: titleStr,
      poster_path: data.poster_path,
      media_type: mediaType
    });
    showToast(newState ? `"${titleStr}" added to Favorites` : `"${titleStr}" removed from Favorites`, newState ? 'success' : 'info');
  };

  const handleToggleEpisode = (episode) => {
    const newState = toggleEpisodeWatched(id, episode.id, {
      title: data.title || data.name || 'Untitled series',
      poster_path: data.poster_path,
      season_number: episode.season_number,
      episode_number: episode.episode_number,
      episode_name: episode.name,
      season_episode_count: seasonData?.episodes?.length || 0
    });
    // Zustand reactivity updates isEpisodeWatched across the component
    showToast(newState ? `Episode marked as Watched` : `Episode unticked`, newState ? 'success' : 'info');
  };

  const handleSeasonChange = (e) => {
    const sNum = parseInt(e.target.value, 10);
    setSelectedSeason(sNum);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <div>Fetching live title details from TMDB...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Title Not Found</h2>
        <p>Could not load details for this title from TMDB.</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const title = data.title || data.name;
  const releaseDate = data.release_date || data.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
  const runtime = data.runtime ? `${data.runtime} mins` : data.episode_run_time?.[0] ? `${data.episode_run_time[0]}m / ep` : 'N/A';
  const genres = data.genres?.map(g => g.name) || [];
  const cast = data.credits?.cast?.slice(0, 8) || [];
  
  // Find YouTube trailer / teaser / video key
  const videoObj = data.videos?.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) ||
                   data.videos?.results?.find(v => v.site === 'YouTube');
  const trailerKey = videoObj?.key;
  const providers = data['watch/providers']?.results?.US?.flatrate || [];

  return (
    <div>
      <Button 
        variant="icon" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem' }}
      >
        <ArrowLeft size={20} />
      </Button>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3000,
          background: toast.type === 'success' ? '#10b981' : 'var(--bg-secondary)',
          color: toast.type === 'success' ? '#ffffff' : 'var(--text-primary)',
          padding: '0.875rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.9rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          {toast.message}
        </div>
      )}

      {/* Hero Section */}
      <div className="title-hero">
        <img src={getBackdropUrl(data.backdrop_path)} alt="Backdrop" className="title-hero-bg" />
        <div className="title-hero-overlay" />
        
        <div className="title-hero-content">
          <img src={getImageUrl(data.poster_path, 'w500')} alt={title} className="title-poster" />
          
          <div className="title-info">
            <h1 className="title-main-heading">{title}</h1>
            
            <div className="title-meta-list">
              <div className="title-meta-item">
                <Star size={18} color="#fbbf24" fill="#fbbf24" />
                <span style={{ fontWeight: 600 }}>{rating}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>({data.vote_count || 0})</span>
              </div>
              <span>•</span>
              <div>{year}</div>
              <span>•</span>
              <div>{mediaType === 'movie' ? 'Movie' : 'TV Series'}</div>
              <span>•</span>
              <div className="title-meta-item">
                <Clock size={16} />
                {runtime}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {genres.map((g, i) => (
                <div key={i} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 999, fontSize: '0.875rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                  {g}
                </div>
              ))}
            </div>
            
            <div className="title-actions">
              <Button variant="accent" icon={Play} onClick={() => setIsTrailerOpen(true)}>
                Watch Trailer
              </Button>

              {/* Interactive Watched Toggle Button */}
              <button 
                onClick={handleToggleWatched}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: watched ? '#10b981' : '#ffffff',
                  color: watched ? '#ffffff' : '#000000',
                  boxShadow: watched ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {watched ? <BookmarkCheck size={20} /> : <Check size={20} />}
                {watched ? '✓ Watched' : 'Mark Watched'}
              </button>

              {/* Interactive Favorite Toggle Button */}
              <button 
                onClick={handleToggleFavorite}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  border: favorited ? 'none' : '1px solid var(--border)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: favorited ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  boxShadow: favorited ? '0 0 20px rgba(244, 63, 94, 0.4)' : 'none'
                }}
              >
                <Heart size={20} fill={favorited ? '#ffffff' : 'none'} color={favorited ? '#ffffff' : 'currentColor'} />
                {favorited ? 'Favorited' : 'Favorite'}
              </button>
              <Button variant="secondary" icon={ListPlus} onClick={() => setIsCollectionPickerOpen(true)}>
                Add to List
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="title-content-grid">
        {/* Main Column */}
        <div>
          <div className="section-heading">
            Synopsis
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '3rem' }}>
            {data.overview || 'No synopsis available for this title.'}
          </p>

          {/* Cast Members */}
          {cast.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> Top Cast
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                {cast.map(person => (
                  <div key={person.id} style={{ textAlign: 'center' }}>
                    <img 
                      src={getImageUrl(person.profile_path, 'w185')} 
                      alt={person.name} 
                      style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '50%', marginBottom: '0.5rem', border: '2px solid var(--border)' }}
                    />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{person.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{person.character}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Seasons & Episodes List for TV Shows */}
          {mediaType === 'tv' && data.seasons && data.seasons.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Seasons & Episodes
                <select 
                  value={selectedSeason} 
                  onChange={handleSeasonChange}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                >
                  {data.seasons.map(s => (
                    <option key={s.id} value={s.season_number}>
                      {s.name} ({s.episode_count} eps)
                    </option>
                  ))}
                </select>
              </div>
              
              {loadingSeason ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Loading season episodes...
                </div>
              ) : seasonData && seasonData.episodes && seasonData.episodes.length > 0 ? (
                <div className="episodes-list">
                  {seasonData.episodes.map(ep => {
                    const epWatched = isEpisodeWatched(id, ep.id);
                    return (
                      <div key={ep.id} className="episode-card">
                        <img src={getImageUrl(ep.still_path || data.poster_path, 'w300')} alt={ep.name} className="episode-thumb" />
                        <div className="episode-info">
                          <div className="episode-title">S{ep.season_number} E{ep.episode_number} - {ep.name}</div>
                          <div className="episode-meta">
                            <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                            {ep.air_date || 'TBA'}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ep.overview || 'No description available for this episode.'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button 
                              onClick={() => handleToggleEpisode(ep)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '0.35rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'all 0.2s',
                                background: epWatched ? '#10b981' : 'var(--bg-secondary)',
                                color: epWatched ? '#ffffff' : 'var(--text-primary)',
                              }}
                            >
                              <Check size={14} />
                              {epWatched ? '✓ Watched' : 'Mark Watched'}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Rate:
                              <RatingWidget max={5} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No episode details available for Season {selectedSeason}.
                </div>
              )}
            </div>
          )}

          <div className="section-heading">
            <MessageCircle size={24} /> Community Reviews & Discussions
          </div>
          <CommentSection titleKey={titleKey} titleData={{ title, poster_path: data.poster_path, media_type: mediaType }} />
        </div>

        {/* Sidebar Column */}
        <div>
          <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Your Rating</h3>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
              <RatingWidget onRate={handleRating} initialRating={userRating} max={10} />
            </div>
            {userRating > 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You rated this {userRating}/10
              </div>
            )}
          </div>

          {/* Streaming / Watch Providers */}
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Where to Watch</h3>
            {providers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {providers.map(provider => (
                  <div key={provider.provider_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} style={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{provider.provider_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stream / Subscription</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Check local streaming services or cable providers for release availability.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Trailer Modal */}
      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoKey={trailerKey} 
        title={title} 
      />

      {isCollectionPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0, 0, 0, 0.72)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '440px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.45)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Add to collection</h2>
              <Button variant="icon" onClick={() => setIsCollectionPickerOpen(false)} aria-label="Close collection picker"><X size={18} /></Button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Choose a list for <strong style={{ color: 'var(--text-primary)' }}>{title}</strong>.</p>
            {collections.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '1rem' }}>Create a collection first, then return here to add this title.</p>
                <Button variant="accent" onClick={() => navigate('/dashboard/collections')}>Create a collection</Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {collections.map(collection => (
                  <button key={collection.id} type="button" onClick={() => handleAddToCollection(collection.id)} style={{ textAlign: 'left', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ fontWeight: 600 }}>{collection.title}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{collection.items?.length || 0} items</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
