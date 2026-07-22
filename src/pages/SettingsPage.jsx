import React, { useState } from 'react';
import { Key, Moon, Sun, Trash2, UserRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ApiKeyModal } from '../components/ui/ApiKeyModal';
import { useUserStore } from '../lib/userStore';

export function SettingsPage() {
  const profile = useUserStore(state => state.profile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const clearTrackerData = useUserStore(state => state.clearTrackerData);
  const [name, setName] = useState(() => profile.name);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const saveProfile = (event) => {
    event.preventDefault();
    setUserProfile({ name });
    setName(name.trim() || 'Alex');
    setMessage('Profile saved.');
  };

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.toggleAttribute('data-theme', nextTheme === 'dark');
    setMessage(`${nextTheme === 'dark' ? 'Dark' : 'Light'} theme selected.`);
  };

  const clearData = () => {
    if (!window.confirm('Clear your local watch history, favorites, ratings, reviews, collections, and saved API key? This cannot be undone.')) return;
    clearTrackerData();
    setName('Alex');
    setTheme('light');
    setMessage('Local app data cleared.');
  };

  const cardStyle = { padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '1rem' };
  return <div style={{ maxWidth: 760 }}>
    <div style={{ marginBottom: '2rem' }}><h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '.5rem' }}>Settings</h1><p style={{ color: 'var(--text-secondary)' }}>Manage your local profile, appearance, and saved app data.</p></div>
    {message && <div style={{ marginBottom: '1rem', padding: '.8rem 1rem', borderRadius: '10px', background: 'rgba(16,185,129,.15)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}>{message}</div>}
    <form onSubmit={saveProfile} style={cardStyle}>
      <h2 style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '1.1rem', marginBottom: '1rem' }}><UserRound size={20} /> Profile</h2>
      <label style={{ display: 'grid', gap: '.5rem', maxWidth: 420 }}>Display name<input value={name} onChange={event => setName(event.target.value)} maxLength={40} style={{ padding: '.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} /></label>
      <Button type="submit" variant="accent" style={{ marginTop: '1rem' }}>Save profile</Button>
    </form>
    <section style={cardStyle}><h2 style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '1.1rem', marginBottom: '1rem' }}>{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />} Appearance</h2><p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1rem' }}>Choose the color theme for this browser.</p><div style={{ display: 'flex', gap: '.75rem' }}><Button variant={theme === 'light' ? 'accent' : 'secondary'} onClick={() => changeTheme('light')} icon={Sun}>Light</Button><Button variant={theme === 'dark' ? 'accent' : 'secondary'} onClick={() => changeTheme('dark')} icon={Moon}>Dark</Button></div></section>
    <section style={cardStyle}><h2 style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '1.1rem', marginBottom: '1rem' }}><Key size={20} /> TMDB connection</h2><p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1rem' }}>Live TMDB data is requested through the secure app proxy when you are signed in. The browser never stores the TMDB secret.</p><Button variant="secondary" onClick={() => setIsKeyModalOpen(true)}>How live data works</Button></section>
    <section style={{ ...cardStyle, borderColor: 'rgba(239,68,68,.35)' }}><h2 style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '1.1rem', marginBottom: '.5rem', color: '#ef4444' }}><Trash2 size={20} /> Clear local data</h2><p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1rem' }}>Remove local watch history, favorites, ratings, reviews, collections, profile, and saved TMDB key from this browser.</p><Button variant="secondary" onClick={clearData} style={{ color: '#ef4444' }}>Clear local data</Button></section>
    <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} onKeySaved={() => { setIsKeyModalOpen(false); setMessage('TMDB connection updated.'); }} />
  </div>;
}
