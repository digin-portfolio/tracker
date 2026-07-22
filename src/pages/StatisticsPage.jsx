import React from 'react';
import { BarChart3, Clock3, Film, Heart, ListChecks, MonitorPlay } from 'lucide-react';
import { useUserStore } from '../lib/userStore';

export function StatisticsPage() {
  // Zustand: auto-reactive — re-renders on any data change
  const getStatisticsData = useUserStore(state => state.getStatisticsData);
  const _watchedItems = useUserStore(state => state.watchedItems); // trigger re-render
  const _watchedEpisodes = useUserStore(state => state.watchedEpisodes); // trigger re-render
  const _favoriteItems = useUserStore(state => state.favoriteItems); // trigger re-render
  const stats = getStatisticsData();

  const maxActivity = Math.max(...stats.activity.map(day => day.count), 1);
  const totalTitles = stats.moviesWatched + stats.seriesWatched;
  const moviePercentage = totalTitles ? Math.round((stats.moviesWatched / totalTitles) * 100) : 0;
  const seriesPercentage = totalTitles ? 100 - moviePercentage : 0;
  const cards = [
    { label: 'Estimated Hours', value: stats.estimatedHours, icon: Clock3, color: '#01b4e4' },
    { label: 'Watched Titles', value: stats.watchedTitles, icon: ListChecks, color: '#10b981' },
    { label: 'Episodes Watched', value: stats.watchedEpisodes, icon: MonitorPlay, color: '#8b5cf6' },
    { label: 'Favorites', value: stats.favorites, icon: Heart, color: '#ec4899' }
  ];

  return <div>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}><BarChart3 size={30} color="var(--accent)" /> Your Statistics</h1>
      <p style={{ color: 'var(--text-secondary)' }}>A live overview of the movies, shows, and episodes you have tracked.</p>
    </div>

    <div className="stats-grid" style={{ marginBottom: '2rem' }}>
      {cards.map(card => <div key={card.label} className="card glass-panel stat-card" style={{ padding: '1.25rem' }}><div className="stat-icon" style={{ color: card.color }}><card.icon size={24} /></div><div><div className="stat-value">{card.value}</div><div className="stat-label">{card.label}</div></div></div>)}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
      <section className="card glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Watched titles by type</h2>
        {totalTitles === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Mark a movie or series watched to see your library breakdown.</p> : <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div aria-label={`${moviePercentage}% movies and ${seriesPercentage}% TV series`} style={{ width: 150, height: 150, flexShrink: 0, borderRadius: '50%', background: `conic-gradient(#ef4444 0 ${moviePercentage}%, #3b82f6 ${moviePercentage}% 100%)`, display: 'grid', placeItems: 'center' }}><div style={{ width: 102, height: 102, background: 'var(--bg-secondary)', borderRadius: '50%', display: 'grid', placeItems: 'center', textAlign: 'center' }}><strong style={{ fontSize: '1.5rem' }}>{totalTitles}</strong><span style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>titles</span></div></div>
          <div style={{ display: 'grid', gap: '.75rem' }}><div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /><Film size={16} /><span>Movies: <strong>{stats.moviesWatched}</strong></span></div><div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} /><MonitorPlay size={16} /><span>TV Series: <strong>{stats.seriesWatched}</strong></span></div></div>
        </div>}
      </section>

      <section className="card glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Activity over the last 7 days</h2>
        <div style={{ height: 180, display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '.6rem', borderBottom: '1px solid var(--border)', padding: '0 .25rem .25rem' }}>
          {stats.activity.map(day => <div key={day.label} style={{ height: '100%', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', gap: '.5rem' }}><span style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{day.count || ''}</span><div title={`${day.count} activity items`} style={{ width: '100%', maxWidth: 32, minHeight: day.count ? 8 : 2, height: `${Math.max((day.count / maxActivity) * 120, day.count ? 8 : 2)}px`, borderRadius: '6px 6px 2px 2px', background: day.count ? 'linear-gradient(180deg, #01b4e4, #0d253f)' : 'var(--border)' }} /><span style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>{day.label}</span></div>)}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.8rem', marginTop: '1rem' }}>Each bar counts titles or episodes marked as watched on that day.</p>
      </section>
    </div>
  </div>;
}
