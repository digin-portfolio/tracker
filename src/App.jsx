import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { TitlePage } from './pages/TitlePage';
import { CategoryPage } from './pages/CategoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RatingsPage } from './pages/RatingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatisticsPage } from './pages/StatisticsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="movies" element={<CategoryPage type="movies" />} />
        <Route path="tv" element={<CategoryPage type="tv" />} />
        <Route path="kdrama" element={<CategoryPage type="kdrama" />} />
        <Route path="anime" element={<CategoryPage type="anime" />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="ratings" element={<RatingsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="collections" element={<Collections />} />
        <Route path="collections/:id" element={<CollectionDetail />} />
        <Route path="title/:id" element={<TitlePage />} />
        {/* Fallback for remaining menu placeholders */}
        <Route path="*" element={
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2>Coming Soon</h2>
            <p>This section is currently under development.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default App;
