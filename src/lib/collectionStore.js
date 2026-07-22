import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Custom storage wrapper to handle QuotaExceededError gracefully
const safeStorage = {
  getItem: (name) => {
    try { return localStorage.getItem(name); }
    catch { return null; }
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, value); }
    catch (err) { console.error('Storage error (QuotaExceeded?):', err); }
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name); }
    catch {}
  }
};

export const useCollectionStore = create(
  persist(
    (set, get) => ({
      collections: [],

      getCollections: () => get().collections,

      createCollection: ({ title, isPrivate }) => {
        const collection = { id: `collection-${Date.now()}`, title: title.trim(), isPrivate, items: [], createdAt: Date.now() };
        set(state => ({ collections: [collection, ...state.collections] }));
        return collection;
      },

      updateCollection: (id, changes) => {
        let updated = null;
        set(state => {
          const collections = state.collections.map(c => {
            if (c.id === id) {
              updated = { ...c, ...changes };
              return updated;
            }
            return c;
          });
          return { collections };
        });
        return updated;
      },

      addCollectionItem: (collectionId, item) => {
        let updated = null;
        set(state => {
          const collections = state.collections.map(c => {
            if (c.id !== collectionId) return c;
            const items = c.items || [];
            if (items.some(existing => existing.title.toLowerCase() === item.title.trim().toLowerCase())) return c;
            updated = { ...c, items: [...items, { ...item, id: `item-${Date.now()}`, title: item.title.trim() }] };
            return updated;
          });
          return { collections };
        });
        return updated;
      },

      removeCollectionItem: (collectionId, itemId) => {
        let updated = null;
        set(state => {
          const collections = state.collections.map(c => {
            if (c.id !== collectionId) return c;
            updated = { ...c, items: (c.items || []).filter(i => i.id !== itemId) };
            return updated;
          });
          return { collections };
        });
        return updated;
      }
    }),
    {
      name: 'trackerpro-collections',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
