'use client';

import { Bell, Search, User } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-header-title">{title}</h1>
        {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
      </div>

      <div className="admin-header-right">
        <div className="admin-search">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Zoeken..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <button className="admin-header-btn">
          <Bell size={20} />
          <span className="admin-notification-badge">3</span>
        </button>

        <div className="admin-user">
          <div className="admin-user-avatar">
            <User size={20} />
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">Admin</span>
            <span className="admin-user-role">Beheerder</span>
          </div>
        </div>
      </div>
    </header>
  );
}
