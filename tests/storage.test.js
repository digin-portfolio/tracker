import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

class MemoryStorage {
  constructor() { this.data = new Map(); }
  clear() { this.data.clear(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  removeItem(key) { this.data.delete(key); }
  setItem(key, value) { this.data.set(key, String(value)); }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = { dispatchEvent: () => true };
globalThis.Event = class Event { constructor(type) { this.type = type; } };
globalThis.document = { documentElement: { removeAttribute: () => {} } };

const userStore = await import('../src/lib/userStore.js');
const collectionStore = await import('../src/lib/collectionStore.js');

beforeEach(() => storage.clear());

test('watched titles and episodes persist and drive dashboard statistics', () => {
  userStore.toggleWatched('movie-1', { title: 'Test Movie', media_type: 'movie', poster_path: '/movie.jpg' });
  userStore.toggleEpisodeWatched('show-1', 'episode-1', {
    title: 'Test Show', poster_path: '/show.jpg', season_number: 1, episode_number: 1,
    episode_name: 'Pilot', season_episode_count: 10
  });

  assert.equal(userStore.isWatched('movie-1'), true);
  assert.equal(userStore.isEpisodeWatched('show-1', 'episode-1'), true);

  const dashboard = userStore.getDashboardData();
  assert.equal(dashboard.stats.find(item => item.kind === 'titles').value, 1);
  assert.equal(dashboard.stats.find(item => item.kind === 'episodes').value, 1);
  assert.equal(dashboard.stats.find(item => item.kind === 'hours').value, 3);
  assert.equal(dashboard.continueWatching.some(item => item.title === 'Test Show'), true);

  userStore.toggleWatched('movie-1');
  userStore.toggleEpisodeWatched('show-1', 'episode-1');
  assert.equal(userStore.isWatched('movie-1'), false);
  assert.equal(userStore.isEpisodeWatched('show-1', 'episode-1'), false);
});

test('ratings and reviews are stored per title and appear in the library', () => {
  const titleKey = 'tv_show-1';
  userStore.setUserRating(titleKey, 9, { title: 'Test Show', poster_path: '/show.jpg', media_type: 'tv' });
  userStore.saveComment(titleKey, {
    id: 1, text: 'Excellent first episode.', rating: 5, timestamp: 1700000000000,
    user: { name: 'You', avatar: '' }
  }, { title: 'Test Show', poster_path: '/show.jpg', media_type: 'tv' });

  assert.equal(userStore.getUserRating(titleKey), 9);
  assert.equal(userStore.getComments(titleKey).length, 1);

  const entry = userStore.getRatingsLibrary()[0];
  assert.equal(entry.title, 'Test Show');
  assert.equal(entry.rating, 9);
  assert.equal(entry.reviewCount, 1);
  assert.equal(entry.latestReview, 'Excellent first episode.');
});

test('watch history is newest first and keeps title and episode entries', () => {
  storage.setItem('trackerpro_watched_items', JSON.stringify({
    movie: { id: 'movie-1', title: 'Older Movie', media_type: 'movie', timestamp: 100 }
  }));
  storage.setItem('trackerpro_watched_episodes', JSON.stringify({
    episode: { tvId: 'show-1', title: 'Newer Show', season_number: 2, episode_number: 3, episode_name: 'New Episode', timestamp: 200 }
  }));

  const history = userStore.getWatchHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].title, 'Newer Show');
  assert.equal(history[0].detail, 'S2 E3 — New Episode');
  assert.equal(history[1].title, 'Older Movie');
});

test('collections can be created, edited, populated, and trimmed', () => {
  const collection = collectionStore.createCollection({ title: 'Weekend Watchlist', isPrivate: true });
  assert.equal(collectionStore.getCollections().length, 1);

  collectionStore.updateCollection(collection.id, { title: 'Updated Watchlist', isPrivate: false });
  collectionStore.addCollectionItem(collection.id, { title: 'Test Movie', year: '2026', media_type: 'movie', poster_path: '/movie.jpg' });
  collectionStore.addCollectionItem(collection.id, { title: 'Test Movie', year: '2026', media_type: 'movie', poster_path: '/movie.jpg' });

  let saved = collectionStore.getCollections()[0];
  assert.equal(saved.title, 'Updated Watchlist');
  assert.equal(saved.isPrivate, false);
  assert.equal(saved.items.length, 1, 'duplicate title is not added twice');

  collectionStore.removeCollectionItem(collection.id, saved.items[0].id);
  saved = collectionStore.getCollections()[0];
  assert.equal(saved.items.length, 0);
});

test('statistics summarize titles, episodes, favorites, and activity', () => {
  userStore.toggleWatched('movie-1', { title: 'Movie', media_type: 'movie' });
  userStore.toggleWatched('show-1', { title: 'Show', media_type: 'tv' });
  userStore.toggleFavorite('show-1', { title: 'Show', media_type: 'tv' });
  userStore.toggleEpisodeWatched('show-1', 'episode-1', { title: 'Show', season_episode_count: 8 });

  const stats = userStore.getStatisticsData();
  assert.equal(stats.moviesWatched, 1);
  assert.equal(stats.seriesWatched, 1);
  assert.equal(stats.watchedEpisodes, 1);
  assert.equal(stats.favorites, 1);
  assert.equal(stats.estimatedHours, 3);
  assert.equal(stats.activity.reduce((total, day) => total + day.count, 0), 3);
});
