'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Warehouse, 
  Tags, 
  ShoppingCart,
  FileText,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Heart,
  LogOut
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Producten', 
    icon: Package,
    children: [
      { name: 'Alle Producten', href: '/admin/products' },
      { name: 'Nieuw Product', href: '/admin/products/new' },
      { name: 'Categorieen', href: '/admin/categories' },
    ]
  },
  { 
    name: 'Bestellingen', 
    icon: ShoppingCart,
    children: [
      { name: 'Alle Bestellingen', href: '/admin/orders' },
      { name: 'Te Verzenden', href: '/admin/orders?status=processing' },
      { name: 'Facturen', href: '/admin/invoices' },
    ]
  },
  { 
    name: 'Klanten', 
    icon: Users,
    children: [
      { name: 'B2C Klanten', href: '/admin/customers/b2c' },
      { name: 'B2B Klanten', href: '/admin/customers/b2b' },
      { name: 'Alle Klanten', href: '/admin/customers' },
    ]
  },
  { 
    name: 'Voorraad', 
    href: '/admin/inventory', 
    icon: Warehouse 
  },
  { 
    name: 'Kortingscodes', 
    href: '/admin/discounts', 
    icon: Tags 
  },
  { 
    name: 'Rapporten', 
    icon: TrendingUp,
    children: [
      { name: 'Verkoop Rapport', href: '/admin/reports/sales' },
      { name: 'Product Rapport', href: '/admin/reports/products' },
      { name: 'Klant Rapport', href: '/admin/reports/customers' },
    ]
  },
  { 
    name: 'Instellingen', 
    href: '/admin/settings', 
    icon: Settings 
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Producten', 'Bestellingen', 'Klanten']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const isChildActive = (children?: { name: string; href: string }[]) => {
    if (!children) return false;
    return children.some(child => pathname.startsWith(child.href.split('?')[0]));
  };

  return (
    <>
      <button 
        className="admin-mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <Link href="/admin" className="admin-sidebar-logo-link">
            <Heart className="admin-sidebar-logo-icon" />
            <span>Liefdeszaken</span>
          </Link>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          {navigation.map((item) => (
            <div key={item.name} className="admin-sidebar-item">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`admin-sidebar-link ${isChildActive(item.children) ? 'active' : ''}`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                    {expandedItems.includes(item.name) ? (
                      <ChevronDown size={16} className="admin-sidebar-chevron" />
                    ) : (
                      <ChevronRight size={16} className="admin-sidebar-chevron" />
                    )}
                  </button>
                  {expandedItems.includes(item.name) && (
                    <div className="admin-sidebar-children">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`admin-sidebar-child-link ${isActive(child.href.split('?')[0]) ? 'active' : ''}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`admin-sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-footer-link">
            <FileText size={18} />
            <span>Bekijk Website</span>
          </Link>
          <button className="admin-sidebar-footer-link logout">
            <LogOut size={18} />
            <span>Uitloggen</span>
          </button>
        </div>
      </aside>
    </>
  );
}
