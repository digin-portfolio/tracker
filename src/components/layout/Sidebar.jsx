import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Tv, 
  Film, 
  Home,
  MonitorPlay,
  Popcorn,
  BookOpen,
  Heart,
  Star,
  Calendar,
  BarChart2,
  Trophy,
  Users,
  Download,
  Settings
} from 'lucide-react';
import './layout.css';

const navItems = [
  { group: 'Menu', items: [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Movies', path: '/dashboard/movies', icon: Film },
    { name: 'TV Series', path: '/dashboard/tv', icon: MonitorPlay },
    { name: 'K-Dramas', path: '/dashboard/kdrama', icon: Popcorn },
    { name: 'Anime', path: '/dashboard/anime', icon: Tv },
  ]},
  { group: 'Library', items: [
    { name: 'Favorites', path: '/dashboard/favorites', icon: Heart },
    { name: 'Collections', path: '/dashboard/collections', icon: BookOpen },
    { name: 'Ratings', path: '/dashboard/ratings', icon: Star },
    { name: 'Calendar', path: '/dashboard/calendar', icon: Calendar },
    { name: 'Statistics', path: '/dashboard/statistics', icon: BarChart2 },
  ]},
  { group: 'Social', items: [
    { name: 'Achievements', path: '/dashboard/achievements', icon: Trophy },
    { name: 'Friends', path: '/dashboard/friends', icon: Users },
  ]},
  { group: 'General', items: [
    { name: 'Import', path: '/dashboard/import', icon: Download },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]}
];

export function Sidebar({ isOpen, onNavigate }) {
  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-header">
        <div style={{ padding: 8, background: 'var(--accent)', borderRadius: 12, color: 'white' }}>
          <Tv size={24} />
        </div>
        <span className="brand-text">Tracker<span className="text-gradient">Pro</span></span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((group, idx) => (
          <div key={idx}>
            <div className="nav-group-title">{group.group}</div>
            {group.items.map((item, i) => (
              <NavLink 
                to={item.path} 
                key={i}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
