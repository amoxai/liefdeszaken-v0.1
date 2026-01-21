import Link from 'next/link';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Euro,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function getAdminDashboardData() {
  const supabase = await createClient();

  // Get total stats
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get revenue stats
  const { data: allOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .eq('payment_status', 'paid');

  const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  // Calculate this month's revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const thisMonthRevenue = allOrders?.filter(
    (o) => new Date(o.created_at) >= startOfMonth
  ).reduce((sum, order) => sum + Number(order.total), 0) || 0;

  // Get last month's revenue for comparison
  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  
  const lastMonthRevenue = allOrders?.filter((o) => {
    const date = new Date(o.created_at);
    return date >= startOfLastMonth && date < startOfMonth;
  }).reduce((sum, order) => sum + Number(order.total), 0) || 0;

  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get orders by status
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: processingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  return {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    totalUsers: totalUsers || 0,
    totalRevenue,
    thisMonthRevenue,
    revenueChange,
    recentOrders: recentOrders || [],
    pendingOrders: pendingOrders || 0,
    processingOrders: processingOrders || 0,
  };
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Admin Dashboard
      </h1>

      {/* Revenue Overview */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>Totale Omzet</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>
              �{data.totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>Deze Maand</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              �{data.thisMonthRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              justifyContent: 'flex-end',
              marginTop: '0.25rem',
              fontSize: '0.875rem'
            }}>
              {data.revenueChange >= 0 ? (
                <>
                  <ArrowUpRight size={16} />
                  <span>+{data.revenueChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight size={16} />
                  <span>{data.revenueChange.toFixed(1)}%</span>
                </>
              )}
              <span style={{ opacity: 0.7 }}>vs vorige maand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats-grid">
        <Link href="/dashboard/admin/orders" className="dashboard-stat-card" style={{ cursor: 'pointer' }}>
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon pink">
              <ShoppingCart size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.totalOrders}</div>
          <div className="dashboard-stat-label">Totaal Orders</div>
        </Link>

        <Link href="/dashboard/admin/products" className="dashboard-stat-card" style={{ cursor: 'pointer' }}>
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon green">
              <Package size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.totalProducts}</div>
          <div className="dashboard-stat-label">Producten</div>
        </Link>

        <Link href="/dashboard/admin/users" className="dashboard-stat-card" style={{ cursor: 'pointer' }}>
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon blue">
              <Users size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.totalUsers}</div>
          <div className="dashboard-stat-label">Gebruikers</div>
        </Link>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon yellow">
              <Euro size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">
            �{(data.totalRevenue / Math.max(data.totalOrders, 1)).toFixed(0)}
          </div>
          <div className="dashboard-stat-label">Gem. Orderwaarde</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          background: '#fef3c7', 
          borderRadius: '0.75rem', 
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontWeight: 600, color: '#92400e' }}>In Afwachting</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e' }}>{data.pendingOrders}</p>
          </div>
          <Link href="/dashboard/admin/orders?status=pending" style={{ color: '#92400e', fontWeight: 500, fontSize: '0.875rem' }}>
            Bekijk ?
          </Link>
        </div>

        <div style={{ 
          background: '#dbeafe', 
          borderRadius: '0.75rem', 
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontWeight: 600, color: '#1e40af' }}>In Behandeling</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e40af' }}>{data.processingOrders}</p>
          </div>
          <Link href="/dashboard/admin/orders?status=processing" style={{ color: '#1e40af', fontWeight: 500, fontSize: '0.875rem' }}>
            Bekijk ?
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-table-container">
        <div className="dashboard-table-header">
          <h2 className="dashboard-table-title">Recente Orders</h2>
          <Link href="/dashboard/admin/orders" className="dashboard-action-button secondary">
            Alle orders
          </Link>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Bestelnummer</th>
                <th>Datum</th>
                <th>Klant</th>
                <th>Status</th>
                <th>Betaling</th>
                <th>Totaal</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link 
                      href={`/dashboard/admin/orders/${order.id}`}
                      style={{ color: '#ec4899', fontWeight: 500 }}
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('nl-NL')}</td>
                  <td>{order.guest_email || 'Ingelogde klant'}</td>
                  <td>
                    <span className={`status-badge status-badge-${order.status}`}>
                      {order.status === 'pending' && 'In afwachting'}
                      {order.status === 'paid' && 'Betaald'}
                      {order.status === 'processing' && 'In behandeling'}
                      {order.status === 'shipped' && 'Verzonden'}
                      {order.status === 'delivered' && 'Bezorgd'}
                      {order.status === 'cancelled' && 'Geannuleerd'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-badge-${order.payment_status}`}>
                      {order.payment_status === 'pending' && 'In afwachting'}
                      {order.payment_status === 'paid' && 'Betaald'}
                      {order.payment_status === 'failed' && 'Mislukt'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>�{Number(order.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
