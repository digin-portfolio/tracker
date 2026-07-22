import React, { useEffect, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { Button } from './Button';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export function AuthControl() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      window.dispatchEvent(new Event('trackerpro_auth_change'));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return null;
  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const action = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error } = await action;
    setLoading(false);
    if (error) setMessage(error.message);
    else if (mode === 'signup') setMessage('Account created. Check your email if confirmation is enabled.');
    else setIsOpen(false);
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  return <>
    {user ? <Button variant="icon" title={`Signed in as ${user.email}`} onClick={signOut} aria-label="Sign out"><LogOut size={18} /></Button>
      : <Button variant="secondary" className="auth-button" icon={UserRound} onClick={() => setIsOpen(true)}>Sign In</Button>}
    {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(0,0,0,.72)' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 400, padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '.5rem' }}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1rem' }}>Sync your TrackerPro data across devices.</p>
        <label style={{ display: 'grid', gap: '.4rem', marginBottom: '.8rem' }}>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} style={{ padding: '.7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} /></label>
        <label style={{ display: 'grid', gap: '.4rem', marginBottom: '1rem' }}>Password<input required minLength="6" type="password" value={password} onChange={event => setPassword(event.target.value)} style={{ padding: '.7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} /></label>
        {message && <p style={{ color: message.includes('created') ? '#10b981' : '#ef4444', fontSize: '.85rem', marginBottom: '.75rem' }}>{message}</p>}
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}><Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" variant="accent" disabled={loading}>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</Button></div>
        <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }} style={{ marginTop: '1rem', background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', padding: 0 }}>{mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
      </form>
    </div>}
  </>;
}
