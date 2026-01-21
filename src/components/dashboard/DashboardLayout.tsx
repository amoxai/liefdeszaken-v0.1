'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Home, 
  Package, 
  User, 
  MapPin, 
  Gift, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'consumer' | 'b2b' | 'employee' | 'admin';
}

const menuItems = {
  consumer: [
    { href: '/dashboard/consumer', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/consumer/orders', icon: Package, label: 'Bestellingen' },
    { href: '/dashboard/consumer/profile', icon: User, label: 'Profiel' },
    { href: '/dashboard/consumer/addresses', icon: MapPin, label: 'Adressen' },
    { href: '/dashboard/consumer/loyalty', icon: Gift, label: 'Loyaliteit' },
  ],
  b2b: [
    { href: '/dashboard/b2b', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/b2b/orders', icon: Package, label: 'Bestellingen' },
    { href: '/dashboard/b2b/profile', icon: User, label: 'Profiel' },
    { href: '/dashboard/b2b/addresses', icon: MapPin, label: 'Adressen' },
    { href: '/dashboard/b2b/invoices', icon: Package, label: 'Facturen' },
  ],
  employee: [
    { href: '/dashboard/employee', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/employee/orders', icon: Package, label: 'Orders' },
    { href: '/dashboard/employee/inventory', icon: Package, label: 'Voorraad' },
  ],
  admin: [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/admin/orders', icon: Package, label: 'Orders' },
    { href: '/dashboard/admin/products', icon: Package, label: 'Producten' },
    { href: '/dashboard/admin/users', icon: User, label: 'Gebruikers' },
    { href: '/dashboard/admin/settings', icon: Settings, label: 'Instellingen' },
  ],
};

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const items = menuItems[role];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-sidebar-header">
          <Link href="/" className="dashboard-sidebar-logo">
            <div className="dashboard-sidebar-logo-icon">
              <Heart size={20} />
            </div>
            <span className="dashboard-sidebar-logo-text">Liefdeszaken</span>
          </Link>
        </div>

        <nav className="dashboard-sidebar-nav">
          <div className="dashboard-nav-section">
            <span className="dashboard-nav-section-title">Menu</span>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`dashboard-nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="dashboard-nav-link-icon" size={20} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="dashboard-user-details">
              <span className="dashboard-user-name">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="dashboard-user-role">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleSignOut} className="dashboard-nav-link" style={{ marginTop: '0.5rem' }}>
            <LogOut className="dashboard-nav-link-icon" size={20} />
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="dashboard-mobile-toggle"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className="dashboard-header-actions">
            <Link href="/products" className="dashboard-action-button secondary">
              Naar webshop
            </Link>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
