import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', ['consumer', 'b2b']);

  return (
    <div className="admin-page">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Welkom terug! Hier is een overzicht van je webshop."
      />

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Producten</span>
            <div className="admin-stat-icon admin-stat-icon-purple">
              <Package size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{totalProducts || 0}</div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Bestellingen</span>
            <div className="admin-stat-icon admin-stat-icon-blue">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{totalOrders || 0}</div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Klanten</span>
            <div className="admin-stat-icon admin-stat-icon-pink">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{totalCustomers || 0}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Snelle Acties</h3>
        </div>
        <div className="admin-quick-actions">
          <Link href="/admin/products/new" className="admin-quick-action">
            <Package size={24} />
            <span>Product Toevoegen</span>
          </Link>
          <Link href="/admin/orders" className="admin-quick-action">
            <ShoppingCart size={24} />
            <span>Bestellingen Bekijken</span>
          </Link>
          <Link href="/admin/customers" className="admin-quick-action">
            <Users size={24} />
            <span>Klanten Beheren</span>
          </Link>
          <Link href="/admin/inventory" className="admin-quick-action">
            <TrendingUp size={24} />
            <span>Voorraad Beheren</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
