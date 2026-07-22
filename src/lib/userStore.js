import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Custom storage wrapper to handle QuotaExceededError gracefully
const safeStorage = {
  getItem: (name) => {
    try { return localStorage.getItem(name); }
    catch { return null; }
  },
  setItem: (name, value) => {
    try { 
      localStorage.setItem(name, value); 
    } catch (err) {
      console.error('Storage error (QuotaExceeded?):', err);
      // We don't crash, we just log it. A toast could be triggered here if we had a global toast emitter.
    }
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name); }
    catch {}
  }
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      watchedItems: {},
      favoriteItems: {},
      watchedEpisodes: {},
      titleRatings: {},
      titleComments: {},
      profile: { name: 'Alex' },

      isWatched: (id) => !!get().watchedItems[id],
      toggleWatched: (id, itemData = {}) => {
        const state = get();
        const current = !!state.watchedItems[id];
        const newWatched = { ...state.watchedItems };
        if (current) {
          delete newWatched[id];
        } else {
          newWatched[id] = {
            id,
            title: itemData.title || itemData.name || 'Untitled',
            poster_path: itemData.poster_path || '',
            media_type: itemData.media_type || 'tv',
            timestamp: Date.now()
          };
        }
        set({ watchedItems: newWatched });
        return !current;
      },

      isFavorite: (id) => !!get().favoriteItems[id],
      toggleFavorite: (id, itemData = {}) => {
        const state = get();
        const current = !!state.favoriteItems[id];
        const newFavs = { ...state.favoriteItems };
        if (current) {
          delete newFavs[id];
        } else {
          newFavs[id] = {
            id,
            title: itemData.title || itemData.name || 'Untitled',
            poster_path: itemData.poster_path || '',
            media_type: itemData.media_type || 'tv',
            timestamp: Date.now()
          };
        }
        set({ favoriteItems: newFavs });
        return !current;
      },

      isEpisodeWatched: (tvId, epId) => !!get().watchedEpisodes[`${tvId}_${epId}`],
      toggleEpisodeWatched: (tvId, epId, episodeData = {}) => {
        const state = get();
        const key = `${tvId}_${epId}`;
        const current = !!state.watchedEpisodes[key];
        const newEps = { ...state.watchedEpisodes };
        if (current) {
          delete newEps[key];
        } else {
          newEps[key] = {
            timestamp: Date.now(),
            tvId,
            epId,
            title: episodeData.title || 'Untitled series',
            poster_path: episodeData.poster_path || '',
            season_number: episodeData.season_number || 1,
            episode_number: episodeData.episode_number || 1,
            episode_name: episodeData.episode_name || `Episode ${episodeData.episode_number || 1}`,
            season_episode_count: episodeData.season_episode_count || 0
          };
        }
        set({ watchedEpisodes: newEps });
        return !current;
      },

      getUserRating: (titleKey) => {
        const entry = get().titleRatings[titleKey];
        return Number(typeof entry === 'object' ? entry.rating : entry) || 0;
      },
      setUserRating: (titleKey, rating, titleData = {}) => {
        set((state) => ({
          titleRatings: {
            ...state.titleRatings,
            [titleKey]: {
              rating,
              title: titleData.title || titleData.name || titleKey,
              poster_path: titleData.poster_path || '',
              media_type: titleData.media_type || titleKey.split('_')[0] || 'tv',
              updatedAt: Date.now()
            }
          }
        }));
      },

      getComments: (titleKey) => {
        const comments = get().titleComments[titleKey];
        return Array.isArray(comments) ? comments : [];
      },
      saveComment: (titleKey, comment, titleData = {}) => {
        const state = get();
        const titleComments = Array.isArray(state.titleComments[titleKey]) ? state.titleComments[titleKey] : [];
        const newComments = [{ ...comment, titleData }, ...titleComments];
        set({
          titleComments: {
            ...state.titleComments,
            [titleKey]: newComments
          }
        });
        return newComments;
      },

      setUserProfile: ({ name }) => {
        set({ profile: { name: name.trim() || 'Alex' } });
      },

      clearTrackerData: () => {
        set({
          watchedItems: {},
          favoriteItems: {},
          watchedEpisodes: {},
          titleRatings: {},
          titleComments: {},
          profile: { name: 'Alex' }
        });
        ['trackerpro_watched_items', 'trackerpro_favorite_items', 'trackerpro_watched_episodes', 'trackerpro_title_ratings', 'trackerpro_title_comments', 'trackerpro_profile', 'tmdb_api_key', 'theme']
          .forEach(key => localStorage.removeItem(key));
        document.documentElement.removeAttribute('data-theme');
      },

      getDashboardData: () => {
        const state = get();
        const watchedItemsArr = Object.values(state.watchedItems);
        const favoritesArr = Object.values(state.favoriteItems);
        const episodesArr = Object.values(state.watchedEpisodes).filter(entry => typeof entry === 'object' && entry !== null);
        const activities = new Map();

        watchedItemsArr.forEach(item => {
          activities.set(`${item.media_type}_${item.id}`, {
            id: item.id, type: item.media_type, title: item.title, img: item.poster_path,
            ep: item.media_type === 'movie' ? 'Marked as watched' : 'Series marked as watched',
            progress: 100, timestamp: item.timestamp || 0
          });
        });

        const episodeGroups = episodesArr.reduce((groups, episode) => {
          const key = String(episode.tvId);
          groups[key] = groups[key] || [];
          groups[key].push(episode);
          return groups;
        }, {});

        Object.entries(episodeGroups).forEach(([tvId, showEpisodes]) => {
          const latest = showEpisodes.reduce((newest, episode) =>
            (episode.timestamp || 0) > (newest.timestamp || 0) ? episode : newest
          );
          const total = latest.season_episode_count || showEpisodes.length;
          activities.set(`tv_${tvId}`, {
            id: tvId, type: 'tv', title: latest.title, img: latest.poster_path,
            ep: `S${latest.season_number} E${latest.episode_number} — ${latest.episode_name}`,
            progress: Math.min(100, Math.round((showEpisodes.length / total) * 100)),
            timestamp: latest.timestamp || 0
          });
        });

        const movieCount = watchedItemsArr.filter(item => item.media_type === 'movie').length;
        const estimatedHours = Math.round((episodesArr.length * 45 + movieCount * 120) / 60);

        return {
          continueWatching: [...activities.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6),
          stats: [
            { label: 'Estimated Hours', value: estimatedHours, kind: 'hours' },
            { label: 'Watched Titles', value: watchedItemsArr.length, kind: 'titles' },
            { label: 'Episodes Watched', value: episodesArr.length, kind: 'episodes' },
            { label: 'Favorites', value: favoritesArr.length, kind: 'favorites' }
          ]
        };
      },

      getWatchHistory: () => {
        const state = get();
        const watchedTitles = Object.values(state.watchedItems).map(item => ({
          id: item.id,
          media_type: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
          detail: item.media_type === 'movie' ? 'Movie marked as watched' : 'Series marked as watched',
          timestamp: item.timestamp || 0
        }));
        const watchedEpisodesArr = Object.values(state.watchedEpisodes)
          .filter(entry => typeof entry === 'object' && entry !== null)
          .map(episode => ({
            id: episode.tvId,
            media_type: 'tv',
            title: episode.title,
            poster_path: episode.poster_path,
            detail: `S${episode.season_number} E${episode.episode_number} — ${episode.episode_name}`,
            timestamp: episode.timestamp || 0
          }));

        return [...watchedEpisodesArr, ...watchedTitles].sort((a, b) => b.timestamp - a.timestamp);
      },

      getStatisticsData: () => {
        const state = get();
        const watchedItemsArr = Object.values(state.watchedItems);
        const episodesArr = Object.values(state.watchedEpisodes).filter(entry => typeof entry === 'object' && entry !== null);
        const favoritesArr = Object.values(state.favoriteItems);
        const moviesWatched = watchedItemsArr.filter(item => item.media_type === 'movie').length;
        const seriesWatched = watchedItemsArr.filter(item => item.media_type !== 'movie').length;
        const estimatedHours = Math.round((episodesArr.length * 45 + moviesWatched * 120) / 60);
        const activity = [...watchedItemsArr, ...episodesArr];
        const days = Array.from({ length: 7 }, (_, index) => {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - (6 - index));
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          const count = activity.filter(item => {
            const timestamp = item.timestamp || 0;
            return timestamp >= date.getTime() && timestamp < nextDate.getTime();
          }).length;
          return {
            label: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
            count
          };
        });

        return {
          watchedTitles: watchedItemsArr.length,
          watchedEpisodes: episodesArr.length,
          favorites: favoritesArr.length,
          estimatedHours,
          moviesWatched,
          seriesWatched,
          activity: days
        };
      },

      getRatingsLibrary: () => {
        const state = get();
        const ratings = state.titleRatings;
        const comments = state.titleComments;

        const titleKeys = new Set([...Object.keys(ratings), ...Object.keys(comments)]);
        return [...titleKeys].map(titleKey => {
          const ratingEntry = ratings[titleKey];
          const titleComments = Array.isArray(comments[titleKey]) ? comments[titleKey] : [];
          const latestComment = titleComments[0];
          const titleData = ratingEntry && typeof ratingEntry === 'object'
            ? ratingEntry
            : latestComment?.titleData || {};
          const [media_type = 'tv', id = titleKey] = titleKey.split('_');

          return {
            id,
            media_type: titleData.media_type || media_type,
            title: titleData.title || titleKey,
            poster_path: titleData.poster_path || '',
            rating: Number(typeof ratingEntry === 'object' ? ratingEntry.rating : ratingEntry) || 0,
            updatedAt: ratingEntry?.updatedAt || latestComment?.timestamp || 0,
            reviewCount: titleComments.length,
            latestReview: latestComment?.text || ''
          };
        }).sort((a, b) => b.updatedAt - a.updatedAt);
      }
    }),
    {
      name: 'trackerpro-user-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
