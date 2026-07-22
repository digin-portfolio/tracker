import React, { useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Star, Loader2 } from 'lucide-react';
import { getPopularMovies, getPopularTV, getKdramas, getAnime, getImageUrl } from '../lib/tmdb';

export function CategoryPage({ type }) {
  const navigate = useNavigate();
  const location = useLocation();

  let title = 'Explore Content';
  let description = 'Browse popular movies and TV series.';
  let mediaType = 'tv';

  if (type === 'movies' || location.pathname.includes('/movies')) {
    title = 'Popular Movies';
    description = 'Discover top rated and trending blockbuster movies from TMDB.';
    mediaType = 'movie';
  } else if (type === 'tv' || location.pathname.includes('/tv')) {
    title = 'TV Series';
    description = 'Popular television series, shows, and seasons.';
    mediaType = 'tv';
  } else if (type === 'kdrama' || location.pathname.includes('/kdrama')) {
    title = 'K-Dramas';
    description = 'Top Korean drama series, romances, and thrillers.';
    mediaType = 'tv';
  } else if (type === 'anime' || location.pathname.includes('/anime')) {
    title = 'Anime';
    description = 'Trending Japanese anime series and animated shows.';
    mediaType = 'tv';
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['category', mediaType, type || location.pathname],
    queryFn: async ({ pageParam = 1 }) => {
      if (mediaType === 'movie') return getPopularMovies(pageParam);
      if (type === 'kdrama' || location.pathname.includes('/kdrama')) return getKdramas(pageParam);
      if (type === 'anime' || location.pathname.includes('/anime')) return getAnime(pageParam);
      return getPopularTV(pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isFetchingNextPage || isFetching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: '200px' });
    
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, isFetching, hasNextPage, fetchNextPage]);

  // Flatten pages and remove potential duplicates
  const items = React.useMemo(() => {
    if (!data) return [];
    const allItems = data.pages.flat();
    const uniqueMap = new Map();
    allItems.forEach(item => uniqueMap.set(item.id, item));
    return Array.from(uniqueMap.values());
  }, [data]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>

      {status === 'pending' ? (
        <div className="trending-grid">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%', borderRadius: '12px' }}></div>
              <div className="skeleton" style={{ height: '1rem', marginTop: '0.75rem', width: '80%', borderRadius: '4px' }}></div>
              <div className="skeleton" style={{ height: '0.8rem', marginTop: '0.5rem', width: '50%', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      ) : status === 'error' ? (
        <div style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>
          Error loading content.
        </div>
      ) : (
        <>
          <div className="trending-grid">
            {items.map((item, index) => {
              const itemTitle = item.title || item.name;
              const date = item.release_date || item.first_air_date;
              const year = date ? date.split('-')[0] : '';
              const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
              
              // Attach the ref to the last item
              const isLastElement = index === items.length - 1;

              return (
                <div 
                  key={`${item.id}-${index}`} 
                  ref={isLastElement ? lastElementRef : null}
                  style={{ cursor: 'pointer', position: 'relative' }} 
                  onClick={() => navigate(`/dashboard/title/${item.id}?type=${mediaType}`)}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                    <img 
                      src={getImageUrl(item.poster_path, 'w500')} 
                      alt={itemTitle} 
                      className="poster" 
                      style={{ aspectRatio: '2/3', width: '100%', objectFit: 'cover' }}
                      loading="lazy"
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
                  <div className="poster-title" style={{ marginTop: '0.5rem', fontWeight: 600 }}>{itemTitle}</div>
                  <div className="poster-meta" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {mediaType === 'movie' ? 'Movie' : 'TV Series'} {year ? `• ${year}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
          
          {isFetchingNextPage && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          
          {!hasNextPage && items.length > 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You've reached the end of the list.
            </div>
          )}
        </>
      )}
    </div>
  );
}
