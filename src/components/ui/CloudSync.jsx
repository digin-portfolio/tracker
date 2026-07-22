import { useEffect } from 'react';
import { initializeCloudSync, isSupabaseConfigured, pushCloudData } from '../../lib/supabase';
import { useUserStore } from '../../lib/userStore';
import { useCollectionStore } from '../../lib/collectionStore';

export function CloudSync() {
  // Subscribe to Zustand store changes — any mutation triggers a re-render and pushes cloud data
  const watchedItems = useUserStore(state => state.watchedItems);
  const favoriteItems = useUserStore(state => state.favoriteItems);
  const watchedEpisodes = useUserStore(state => state.watchedEpisodes);
  const titleRatings = useUserStore(state => state.titleRatings);
  const collections = useCollectionStore(state => state.collections);

  // Initialize cloud sync on mount and auth changes
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const initialize = () => initializeCloudSync().catch(() => {});
    initialize();
    window.addEventListener('trackerpro_auth_change', initialize);
    return () => window.removeEventListener('trackerpro_auth_change', initialize);
  }, []);

  // Push data to cloud whenever any tracked store slice changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => pushCloudData().catch(() => {}), 800);
    return () => clearTimeout(timer);
  }, [watchedItems, favoriteItems, watchedEpisodes, titleRatings, collections]);

  return null;
}
