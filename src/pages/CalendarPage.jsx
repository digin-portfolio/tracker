import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Film, Loader2, MonitorPlay } from 'lucide-react';
import { getImageUrl, getUpcomingCalendar } from '../lib/tmdb';

const formatDate = (date) => new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`));

export function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCalendar = async () => {
      setLoading(true);
      setEvents(await getUpcomingCalendar());
      setLoading(false);
    };
    loadCalendar();
  }, []);

  const groups = events.reduce((result, event) => {
    result[event.date] = result[event.date] || [];
    result[event.date].push(event);
    return result;
  }, {});

  return <div>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}><CalendarDays color="var(--accent)" size={30} /> Release Calendar</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Upcoming TV episodes and movie releases from TMDB.</p>
    </div>

    {loading ? <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)', gap: '.75rem' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /><span>Loading upcoming releases...</span></div>
      : events.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px' }}>No upcoming releases were found. Try connecting your TMDB API key in Settings.</div>
      : <div style={{ display: 'grid', gap: '1.75rem' }}>
        {Object.entries(groups).map(([date, items]) => <section key={date}>
          <h2 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{formatDate(date)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {items.map(event => <button key={`${event.media_type}_${event.id}`} type="button" onClick={() => navigate(`/dashboard/title/${event.id}?type=${event.media_type}`)} style={{ padding: '.75rem', display: 'flex', alignItems: 'center', gap: '.9rem', textAlign: 'left', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}>
              <img src={getImageUrl(event.poster_path, 'w185')} alt={event.title} style={{ width: 52, height: 76, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={element => { element.currentTarget.src = getImageUrl(''); }} />
              <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{event.title}</span><span style={{ display: 'block', marginTop: '.25rem', fontSize: '.85rem', color: 'var(--text-secondary)' }}>{event.detail}</span><span style={{ display: 'flex', gap: '.35rem', alignItems: 'center', marginTop: '.5rem', fontSize: '.78rem', color: 'var(--accent)' }}>{event.media_type === 'movie' ? <Film size={14} /> : <MonitorPlay size={14} />}{event.media_type === 'movie' ? 'Movie' : 'TV episode'}</span></span>
            </button>)}
          </div>
        </section>)}
      </div>}
  </div>;
}
