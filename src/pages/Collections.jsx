import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, Globe, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useCollectionStore } from '../lib/collectionStore';
import { getImageUrl } from '../lib/tmdb';
import './collections.css';

export function Collections() {
  const navigate = useNavigate();
  // Zustand: auto-reactive
  const collections = useCollectionStore(state => state.collections);
  const createCollection = useCollectionStore(state => state.createCollection);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const handleCreate = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    const collection = createCollection({ title, isPrivate });
    navigate(`/dashboard/collections/${collection.id}`);
  };

  return (
    <div>
      <div className="collections-header">
        <div><h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Your Collections</h1><p style={{ color: 'var(--text-secondary)' }}>Create personal lists of movies and shows.</p></div>
        <Button variant="accent" icon={Plus} onClick={() => setIsCreating(true)}>Create List</Button>
      </div>

      {collections.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your lists will appear here</h2><p>Create a collection to start curating your watchlist.</p>
        </div>
      ) : <div className="collections-grid">
        {collections.map(collection => {
          const images = (collection.items || []).slice(0, 4).map(item => getImageUrl(item.poster_path, 'w300'));
          return <div key={collection.id} className="collection-card" onClick={() => navigate(`/dashboard/collections/${collection.id}`)}>
            <div className="collection-privacy">{collection.isPrivate ? <Lock size={12} /> : <Globe size={12} />}{collection.isPrivate ? 'Private' : 'Public'}</div>
            <div className="collection-bg-grid">{Array.from({ length: 4 }, (_, index) => <img key={index} src={images[index] || getImageUrl('')} alt="" className="collection-bg-item" />)}</div>
            <div className="collection-overlay"><h3 className="collection-title">{collection.title}</h3><div className="collection-meta">{collection.items?.length || 0} Items</div></div>
          </div>;
        })}
      </div>}

      {isCreating && <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.7)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
        <form onSubmit={handleCreate} style={{ width: '100%', maxWidth: 420, padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h2>Create collection</h2><Button type="button" variant="icon" onClick={() => setIsCreating(false)}><X size={18} /></Button></div>
          <label style={{ display: 'grid', gap: '.5rem', marginBottom: '1rem' }}>List name<input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Weekend watchlist" style={{ padding: '.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}><input type="checkbox" checked={isPrivate} onChange={event => setIsPrivate(event.target.checked)} /> Keep this list private</label>
          <Button type="submit" variant="accent" style={{ width: '100%' }}>Create list</Button>
        </form>
      </div>}
    </div>
  );
}
