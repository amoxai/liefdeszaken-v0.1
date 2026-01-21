import Link from 'next/link';
import { Package, Gift, ShoppingBag, ArrowRight, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function getDashboardData() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get recent orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get order count
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get total spent
  const { data: totalData } = await supabase
    .from('orders')
    .select('total')
    .eq('user_id', user.id)
    .eq('payment_status', 'paid');

  const totalSpent = totalData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return {
    profile,
    orders: orders || [],
    orderCount: orderCount || 0,
    totalSpent,
    loyaltyPoints: profile?.loyalty_points || 0,
  };
}

export default async function ConsumerDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <div>Laden...</div>;
  }

  const { profile, orders, orderCount, totalSpent, loyaltyPoints } = data;

  // Calculate progress to next reward (every 500 points)
  const nextRewardAt = Math.ceil((loyaltyPoints + 1) / 500) * 500;
  const progressPercentage = ((loyaltyPoints % 500) / 500) * 100;

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Welkom terug, {profile?.first_name || 'Klant'}!
      </h1>

      {/* Stats */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon pink">
              <Package size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{orderCount}</div>
          <div className="dashboard-stat-label">Bestellingen</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon green">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">�{totalSpent.toFixed(2)}</div>
          <div className="dashboard-stat-label">Totaal uitgegeven</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon yellow">
              <Gift size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{loyaltyPoints}</div>
          <div className="dashboard-stat-label">Loyaliteitspunten</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon blue">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{nextRewardAt - loyaltyPoints}</div>
          <div className="dashboard-stat-label">Punten tot volgende beloning</div>
        </div>
      </div>

      {/* Loyalty Card */}
      <div className="loyalty-card" style={{ marginBottom: '2rem' }}>
        <div className="loyalty-card-header">
          <span className="loyalty-card-title">Jouw Loyaliteitspunten</span>
          <Gift size={24} />
        </div>
        <div className="loyalty-card-points">
          {loyaltyPoints} <span>punten</span>
        </div>
        <div className="loyalty-progress-bar">
          <div 
            className="loyalty-progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="loyalty-progress-text">
          Nog {nextRewardAt - loyaltyPoints} punten tot je volgende beloning!
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-table-container">
        <div className="dashboard-table-header">
          <h2 className="dashboard-table-title">Recente Bestellingen</h2>
          <Link href="/dashboard/consumer/orders" className="dashboard-action-button secondary">
            Alle bestellingen
            <ArrowRight size={16} />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Bestelnummer</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Totaal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link 
                        href={`/dashboard/consumer/orders/${order.id}`}
                        style={{ color: '#ec4899', fontWeight: 500 }}
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('nl-NL')}</td>
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
                    <td style={{ fontWeight: 600 }}>�{Number(order.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Je hebt nog geen bestellingen geplaatst.</p>
            <Link href="/products" className="dashboard-action-button" style={{ marginTop: '1rem' }}>
              Bekijk producten
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
