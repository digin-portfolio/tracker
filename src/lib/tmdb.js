// TMDB API Service with Live API Key Support & Fallback Logic

import { supabase } from './supabase';

export const getApiKey = () => {
  return '';
};

export const setApiKey = () => {
  localStorage.removeItem('tmdb_api_key');
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1920&q=80';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Fallback Mock Data for when no API Key is set
const MOCK_TRENDING = [
  { id: '106379', title: 'Fallout', name: 'Fallout', media_type: 'tv', first_air_date: '2024-04-10', poster_path: '/cvu5aP252F7b2XF9WdFpZ1QzG8Z.jpg', backdrop_path: '/y7s4E0M0C7uJ4q4a1y5Xq.jpg', vote_average: 8.4, overview: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.' },
  { id: '693134', title: 'Dune: Part Two', media_type: 'movie', release_date: '2024-02-27', poster_path: '/1pdfLvkbY8OhJlCjEkgRFi9hUtY.jpg', backdrop_path: '/xOMo8ScSu2n22x99xD34f4.jpg', vote_average: 8.2, overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.' },
  { id: '94605', title: 'Arcane', name: 'Arcane', media_type: 'tv', first_air_date: '2021-11-06', poster_path: '/ab29v0P9x5CgD1j7yX0q8A.jpg', backdrop_path: '/fqZjR8mQ5xK1Gf1J8q.jpg', vote_average: 8.7, overview: 'Amid the warring twin cities of Piltover and Zaun, two sisters fight on opposing sides of a war between magical technologies and incompatible convictions.' },
  { id: '93405', title: 'Squid Game', name: 'Squid Game', media_type: 'tv', first_air_date: '2021-09-17', poster_path: '/dDlEmu3EZ0Pgg93K2SVNen3Gfl.jpg', backdrop_path: '/yR4B574G0R1G7pP4u.jpg', vote_average: 7.8, overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games with high stakes.' },
  { id: '114472', title: 'Shogun', name: 'Shogun', media_type: 'tv', first_air_date: '2024-02-27', poster_path: '/7O4iVfJ92RjW6z9J8a7k.jpg', backdrop_path: '/2me7vC7G9z9X8Gf.jpg', vote_average: 8.5, overview: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.' },
  { id: '105248', title: 'Cyberpunk: Edgerunners', name: 'Cyberpunk: Edgerunners', media_type: 'tv', first_air_date: '2022-09-13', poster_path: '/7rU1Z9A1K.jpg', backdrop_path: '/iR8zX1.jpg', vote_average: 8.6, overview: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.' }
];

// These detail records make every fallback card usable before an API key is added.
// The image helpers display their built-in artwork when a path is absent.
const getMockDetail = (id, type) => {
  const item = MOCK_TRENDING.find(entry => entry.id === String(id));
  if (!item || (type === 'movie' && item.media_type !== 'movie')) return null;

  const isMovie = item.media_type === 'movie';
  return {
    ...item,
    title: item.title || item.name,
    name: item.name || item.title,
    poster_path: null,
    backdrop_path: null,
    vote_count: 1000,
    runtime: isMovie ? 150 : undefined,
    episode_run_time: isMovie ? [] : [45],
    genres: isMovie
      ? [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }]
      : [{ id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' }],
    credits: { cast: [] },
    videos: { results: [] },
    'watch/providers': { results: {} },
    seasons: isMovie ? undefined : [{
      id: `${id}-season-1`, name: 'Season 1', season_number: 1, episode_count: 8
    }]
  };
};

const getMockSeason = (tvId, seasonNumber) => {
  const detail = getMockDetail(tvId, 'tv');
  if (!detail || Number(seasonNumber) !== 1) return null;

  return {
    id: `${tvId}-season-1`,
    name: 'Season 1',
    season_number: 1,
    episodes: Array.from({ length: 8 }, (_, index) => ({
      id: `${tvId}-episode-${index + 1}`,
      name: `Episode ${index + 1}`,
      season_number: 1,
      episode_number: index + 1,
      air_date: 'Available with TMDB connection',
      overview: 'Connect a TMDB API key to view official episode information and artwork.'
    }))
  };
};

export const fetchFromTMDB = async (endpoint) => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY || '9a9c53620db722c1693223034acd306d';
  if (apiKey) {
    const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('TMDB direct request failed');
    return res.json();
  }

  if (!supabase) throw new Error('NO_API_KEY');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('NO_API_KEY');
  const { data, error } = await supabase.functions.invoke('tmdb-proxy', { body: { endpoint } });
  if (error) throw new Error(error.message || 'TMDB proxy request failed');
  return data;
};

export const getTrending = async (mediaType = 'all', timeWindow = 'week') => {
  try {
    const data = await fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
    return data.results || [];
  } catch (err) {
    if (err.message !== 'NO_API_KEY') {
      console.warn("TMDB Trending fetch error:", err.message);
    }
    return MOCK_TRENDING;
  }
};

export const getPopularMovies = async (page = 1) => {
  try {
    const data = await fetchFromTMDB(`/movie/popular?page=${page}`);
    return data.results || [];
  } catch (err) {
    console.warn("TMDB Popular Movies fetch error:", err.message);
    return MOCK_TRENDING.filter(item => item.media_type === 'movie');
  }
};

export const getPopularTV = async (page = 1) => {
  try {
    const data = await fetchFromTMDB(`/tv/popular?page=${page}`);
    return data.results || [];
  } catch (err) {
    console.warn("TMDB Popular TV fetch error:", err.message);
    return MOCK_TRENDING.filter(item => item.media_type === 'tv');
  }
};

export const getKdramas = async (page = 1) => {
  try {
    const data = await fetchFromTMDB(`/discover/tv?with_original_language=ko&sort_by=popularity.desc&page=${page}`);
    return data.results || [];
  } catch (err) {
    console.warn("TMDB Kdramas fetch error:", err.message);
    return MOCK_TRENDING;
  }
};

export const getAnime = async (page = 1) => {
  try {
    const data = await fetchFromTMDB(`/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`);
    return data.results || [];
  } catch (err) {
    console.warn("TMDB Anime fetch error:", err.message);
    return MOCK_TRENDING;
  }
};

export const searchMulti = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
    return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person');
  } catch (err) {
    console.warn("TMDB Search error:", err.message);
    return [];
  }
};

export const getDetails = async (id, type = 'tv') => {
  try {
    const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=credits,videos,recommendations,similar,watch/providers`);
    return data;
  } catch (err) {
    console.warn(`TMDB Details fetch error for ${type}/${id}:`, err.message);
    return getMockDetail(id, type);
  }
};

export const getSeasonDetails = async (tvId, seasonNumber = 1) => {
  try {
    const data = await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
  } catch (err) {
    console.warn(`TMDB Season fetch error for tv/${tvId}/season/${seasonNumber}:`, err.message);
    return getMockSeason(tvId, seasonNumber);
  }
};

const MOCK_CALENDAR_EVENTS = [
  { id: '106379', media_type: 'tv', title: 'Fallout', date: '2026-07-24', detail: 'Season 2 · Episode 1', poster_path: '' },
  { id: '94605', media_type: 'tv', title: 'Arcane', date: '2026-07-26', detail: 'Season 3 · Episode 1', poster_path: '' },
  { id: '693134', media_type: 'movie', title: 'Dune: Part Two', date: '2026-07-29', detail: 'Movie release', poster_path: '' },
  { id: '114472', media_type: 'tv', title: 'Shogun', date: '2026-08-02', detail: 'Season 2 · Episode 1', poster_path: '' }
];

export const getUpcomingCalendar = async () => {
  try {
    const [tvData, movieData] = await Promise.all([
      fetchFromTMDB('/tv/on_the_air?page=1'),
      fetchFromTMDB('/movie/upcoming?page=1')
    ]);
    const shows = (tvData.results || []).slice(0, 8);
    const details = await Promise.all(shows.map(show => fetchFromTMDB(`/tv/${show.id}`).catch(() => null)));
    const tvEvents = details.filter(Boolean).flatMap(show => {
      const episode = show.next_episode_to_air;
      if (!episode?.air_date) return [];
      return [{
        id: String(show.id),
        media_type: 'tv',
        title: show.name,
        date: episode.air_date,
        detail: `S${episode.season_number} E${episode.episode_number} · ${episode.name}`,
        poster_path: show.poster_path
      }];
    });
    const movieEvents = (movieData.results || []).slice(0, 12)
      .filter(movie => movie.release_date)
      .map(movie => ({
        id: String(movie.id),
        media_type: 'movie',
        title: movie.title,
        date: movie.release_date,
        detail: 'Movie release',
        poster_path: movie.poster_path
      }));

    return [...tvEvents, ...movieEvents]
      .filter(event => event.date >= new Date().toISOString().slice(0, 10))
      .sort((first, second) => first.date.localeCompare(second.date));
  } catch (err) {
    if (err.message !== 'NO_API_KEY') console.warn('TMDB calendar fetch error:', err.message);
    return MOCK_CALENDAR_EVENTS;
  }
};
