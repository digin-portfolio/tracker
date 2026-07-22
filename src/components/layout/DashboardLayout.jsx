import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { CloudSync } from '../ui/CloudSync';
import './layout.css';

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <CloudSync />
      <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button type="button" className="sidebar-backdrop" aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} />}
      <main className="main-content">
        <TopNav onMenuToggle={() => setIsSidebarOpen(open => !open)} />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
