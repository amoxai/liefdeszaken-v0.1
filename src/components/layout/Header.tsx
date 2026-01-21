'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { getItemCount, openCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const itemCount = getItemCount();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'employee':
        return '/dashboard/employee';
      case 'b2b':
        return '/dashboard/b2b';
      default:
        return '/dashboard/consumer';
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo">
          <div className="header-logo-icon">
            <Heart size={20} />
          </div>
          <span className="header-logo-text">
            Liefdes<span>zaken</span>
          </span>
        </Link>

        <nav className="header-nav">
          <Link href="/products" className="header-nav-link">
            Producten
          </Link>
          <Link href="/products?featured=true" className="header-nav-link">
            Aanbiedingen
          </Link>
          <Link href="/about" className="header-nav-link">
            Over ons
          </Link>
          <Link href="/contact" className="header-nav-link">
            Contact
          </Link>
        </nav>

        <div className="header-actions">
          <form onSubmit={handleSearch} className="header-search">
            <Search size={18} className="header-search-icon" />
            <input
              type="text"
              placeholder="Zoeken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
            />
          </form>

          <button
            onClick={openCart}
            className="header-icon-button"
            aria-label="Winkelwagen"
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="header-cart-badge">{itemCount}</span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="header-user-menu">
              <Link href={getDashboardLink()} className="header-icon-button">
                <User size={22} />
              </Link>
            </div>
          ) : (
            <Link href="/login" className="header-login-button">
              Inloggen
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-button"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link
          href="/products"
          className="mobile-menu-link"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Producten
        </Link>
        <Link
          href="/products?featured=true"
          className="mobile-menu-link"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Aanbiedingen
        </Link>
        <Link
          href="/about"
          className="mobile-menu-link"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Over ons
        </Link>
        <Link
          href="/contact"
          className="mobile-menu-link"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Contact
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              href={getDashboardLink()}
              className="mobile-menu-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Mijn Account
            </Link>
            <button
              onClick={() => {
                handleSignOut();
                setIsMobileMenuOpen(false);
              }}
              className="mobile-menu-link"
            >
              Uitloggen
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="mobile-menu-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inloggen
            </Link>
            <Link
              href="/register"
              className="mobile-menu-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Registreren
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
