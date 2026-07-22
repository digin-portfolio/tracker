import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Lock, Globe, Share2, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useCollectionStore } from '../lib/collectionStore';
import { getImageUrl } from '../lib/tmdb';
import './collections.css';

export function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Zustand: auto-reactive — no manual refresh or event listeners needed
  const collections = useCollectionStore(state => state.collections);
  const addCollectionItem = useCollectionStore(state => state.addCollectionItem);
  const removeCollectionItem = useCollectionStore(state => state.removeCollectionItem);
  const updateCollection = useCollectionStore(state => state.updateCollection);
  const collection = collections.find(entry => entry.id === id);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemYear, setItemYear] = useState('');
  const [itemType, setItemType] = useState('movie');
  const [editTitle, setEditTitle] = useState('');
  const [editPrivate, setEditPrivate] = useState(true);

  if (!collection) return <div style={{ textAlign: 'center', padding: '4rem' }}><h1>Collection not found</h1><Button variant="secondary" onClick={() => navigate('/dashboard/collections')} style={{ marginTop: '1rem' }}>Back to collections</Button></div>;
  const items = collection.items || [];
  const cover = getImageUrl(items[0]?.poster_path, 'w780');
  const saveEdit = (event) => { event.preventDefault(); if (!editTitle.trim()) return; updateCollection(id, { title: editTitle.trim(), isPrivate: editPrivate }); setShowEdit(false); };
  const addItem = (event) => { event.preventDefault(); if (!itemTitle.trim()) return; addCollectionItem(id, { title: itemTitle, year: itemYear, media_type: itemType, poster_path: '' }); setItemTitle(''); setItemYear(''); setShowAdd(false); };
  const startEdit = () => { setEditTitle(collection.title); setEditPrivate(collection.isPrivate); setShowEdit(true); };
  const share = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch { /* Clipboard access is optional. */ } };

  return <div>
    <Button variant="icon" onClick={() => navigate('/dashboard/collections')} style={{ marginBottom: '1rem' }}><ArrowLeft size={20} /></Button>
    <div className="collection-detail-header"><img src={cover} alt="Cover" className="collection-detail-bg" /><div className="collection-detail-overlay" />
      <div className="collection-detail-content"><div><div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-secondary)', marginBottom: '.5rem' }}>{collection.isPrivate ? <Lock size={16} /> : <Globe size={16} />}{collection.isPrivate ? 'Private Collection' : 'Public Collection'}</div><h1 className="collection-detail-title">{collection.title}</h1><p style={{ color: 'rgba(255,255,255,.7)' }}>{items.length} items · Created by you</p></div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}><Button variant="secondary" icon={Edit2} onClick={startEdit}>Edit</Button><Button variant="secondary" icon={Share2} onClick={share}>Share</Button><Button variant="accent" icon={Plus} onClick={() => setShowAdd(true)}>Add Item</Button></div>
      </div>
    </div>
    {items.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>This list is empty. Add your first movie or show.</div> : <div className="collection-items-grid">{items.map(item => <div key={item.id} className="list-item-card"><button type="button" className="list-item-remove" onClick={() => removeCollectionItem(id, item.id)} title="Remove from list"><X size={14} /></button><img src={getImageUrl(item.poster_path, 'w300')} alt={item.title} className="list-item-poster" /><div className="list-item-title">{item.title}</div><div style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{item.year || item.media_type}</div></div>)}</div>}
    {showAdd && <form onSubmit={addItem} style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'end' }}><label style={{ display: 'grid', gap: '.35rem', flex: '1 1 180px' }}>Title<input autoFocus value={itemTitle} onChange={event => setItemTitle(event.target.value)} style={{ padding: '.65rem' }} /></label><label style={{ display: 'grid', gap: '.35rem', width: 100 }}>Year<input value={itemYear} onChange={event => setItemYear(event.target.value)} inputMode="numeric" style={{ padding: '.65rem' }} /></label><label style={{ display: 'grid', gap: '.35rem' }}>Type<select value={itemType} onChange={event => setItemType(event.target.value)} style={{ padding: '.65rem' }}><option value="movie">Movie</option><option value="tv">TV series</option></select></label><Button type="submit" variant="accent">Add</Button><Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button></form>}
    {showEdit && <form onSubmit={saveEdit} style={{ marginTop: '1rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'end' }}><label style={{ display: 'grid', gap: '.35rem', flex: 1 }}>List name<input value={editTitle} onChange={event => setEditTitle(event.target.value)} style={{ padding: '.65rem' }} /></label><label style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}><input type="checkbox" checked={editPrivate} onChange={event => setEditPrivate(event.target.checked)} /> Private</label><Button type="submit" variant="accent">Save</Button><Button type="button" variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button></form>}
  </div>;
}
