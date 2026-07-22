import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Key, Film, Tv, User as UserIcon, X, Loader2, Menu } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { ApiKeyModal } from '../ui/ApiKeyModal';
import { AuthControl } from '../ui/AuthControl';
import { searchMulti, getImageUrl } from '../../lib/tmdb';
import { supabase } from '../../lib/supabase';
import './layout.css';

export function TopNav({ onMenuToggle }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data: { session } }) => setHasKey(Boolean(session)));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setHasKey(Boolean(session)));
    return () => subscription.unsubscribe();
  }, []);

  // Debounced search call to TMDB API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchMulti(query);
      setResults(res.slice(0, 8));
      setIsOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    const type = item.media_type || 'tv';
    navigate(`/dashboard/title/${item.id}?type=${type}`);
  };

  const getMediaBadge = (type) => {
    switch (type) {
      case 'movie': return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}><Film size={10} style={{ marginRight: 2, display: 'inline' }} />Movie</span>;
      case 'tv': return <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}><Tv size={10} style={{ marginRight: 2, display: 'inline' }} />Series</span>;
      case 'person': return <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}><UserIcon size={10} style={{ marginRight: 2, display: 'inline' }} />Actor</span>;
      default: return null;
    }
  };

  return (
    <>
      <header className="top-nav">
        <Button variant="icon" className="mobile-menu-button" onClick={onMenuToggle} aria-label="Open navigation menu">
          <Menu size={22} />
        </Button>
        <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search movies, TV shows from TMDB..." 
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
          />
          {loading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-secondary)', animation: 'spin 1s linear infinite' }} />
          ) : query ? (
            <X size={16} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setQuery('')} />
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--border)', padding: '2px 6px', borderRadius: 4 }}>
              Live TMDB
            </div>
          )}

          {/* Search Dropdown Results */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 100,
              padding: '0.5rem'
            }}>
              {results.length > 0 ? (
                results.map((item) => {
                  const title = item.title || item.name;
                  const date = item.release_date || item.first_air_date;
                  const year = date ? date.split('-')[0] : '';
                  const img = item.poster_path || item.profile_path;

                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <img 
                        src={getImageUrl(img, 'w92')} 
                        alt={title} 
                        style={{ width: 36, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                          {getMediaBadge(item.media_type)}
                          {year && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{year}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  No titles found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="top-nav-actions">
          <Button 
            variant="icon" 
            title={hasKey ? "TMDB API Connected" : "Connect TMDB API Key"}
            onClick={() => setIsKeyModalOpen(true)}
            style={{ position: 'relative' }}
          >
            <Key size={18} color={hasKey ? '#10b981' : 'var(--text-secondary)'} />
            {hasKey && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981'
              }} />
            )}
          </Button>

          <Button variant="icon">
            <Bell size={20} />
          </Button>
          <ThemeToggle />
          <AuthControl />
          
          <div className="avatar">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4" 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </header>

      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={(k) => setHasKey(!!k)}
      />
    </>
  );
}
