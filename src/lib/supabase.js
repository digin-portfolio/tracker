import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(url && publishableKey);
export const supabase = isSupabaseConfigured ? createClient(url, publishableKey) : null;

const SYNC_KEYS = [
  'trackerpro-user-storage',
  'trackerpro-collections',
  'theme',
  'tmdb_api_key'
];

const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const pushCloudData = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  const data = Object.fromEntries(SYNC_KEYS.map(key => [key, localStorage.getItem(key)]));
  const { error } = await supabase.from('tracker_data').upsert({ user_id: user.id, data, updated_at: new Date().toISOString() });
  if (error) throw error;
  return true;
};

export const pullCloudData = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data, error } = await supabase.from('tracker_data').select('data').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (!data?.data) return false;
  // Write the cloud data back to localStorage so Zustand persist can rehydrate
  SYNC_KEYS.forEach(key => {
    const value = data.data[key];
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  });
  // Rehydrate Zustand stores from localStorage without a page reload
  // This is a lazy import to avoid circular dependencies
  import('../lib/userStore').then(({ useUserStore }) => {
    useUserStore.persist.rehydrate();
  }).catch(() => {});
  import('../lib/collectionStore').then(({ useCollectionStore }) => {
    useCollectionStore.persist.rehydrate();
  }).catch(() => {});
  return true;
};

export const initializeCloudSync = async () => {
  if (!supabase) return false;
  const pulled = await pullCloudData();
  if (!pulled) await pushCloudData();
  return true;
};
