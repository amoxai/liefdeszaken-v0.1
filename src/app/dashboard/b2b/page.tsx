import Link from 'next/link';
import { Package, FileText, Building2, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function getB2BDashboardData() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user profile with B2B details
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      b2b_price_list:b2b_price_lists(*)
    `)
    .eq('id', user.id)
    .single();

  // Get recent orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_b2b', true)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get order stats
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing']);

  // Get total spent this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyData } = await supabase
    .from('orders')
    .select('total')
    .eq('user_id', user.id)
    .eq('payment_status', 'paid')
    .gte('created_at', startOfMonth.toISOString());

  const monthlySpent = monthlyData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return {
    profile,
    orders: orders || [],
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    monthlySpent,
    discountPercentage: profile?.b2b_price_list?.discount_percentage || 0,
  };
}

export default async function B2BDashboardPage() {
  const data = await getB2BDashboardData();

  if (!data) {
    return <div>Laden...</div>;
  }

  const { profile, orders, totalOrders, pendingOrders, monthlySpent, discountPercentage } = data;

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Welkom, {profile?.company_name || profile?.first_name || 'Zakelijke Klant'}!
      </h1>

      {/* VAT Status Banner */}
      {profile?.vat_number && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: profile.vat_validated ? '#d1fae5' : '#fef3c7',
          color: profile.vat_validated ? '#065f46' : '#92400e',
        }}>
          {profile.vat_validated ? (
            <>
              <CheckCircle size={20} />
              <span>BTW-nummer geverifieerd: {profile.vat_number}</span>
            </>
          ) : (
            <>
              <AlertCircle size={20} />
              <span>BTW-nummer in behandeling: {profile.vat_number}</span>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon pink">
              <Package size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{totalOrders}</div>
          <div className="dashboard-stat-label">Totaal Bestellingen</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon yellow">
              <ShoppingCart size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{pendingOrders}</div>
          <div className="dashboard-stat-label">In Behandeling</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon green">
              <FileText size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">€{monthlySpent.toFixed(0)}</div>
          <div className="dashboard-stat-label">Deze Maand</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon blue">
              <Building2 size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{discountPercentage}%</div>
          <div className="dashboard-stat-label">Uw Korting</div>
        </div>
      </div>

      {/* B2B Benefits */}
      <div className="checkout-form-section" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Uw Zakelijke Voordelen
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <strong style={{ color: '#ec4899' }}>{discountPercentage}% Korting</strong>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Op alle producten
            </p>
          </div>
          {profile?.can_order_on_invoice && (
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#ec4899' }}>Factuur Betaling</strong>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Bestel op factuur
              </p>
            </div>
          )}
          {profile?.vat_validated && (
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
              <strong style={{ color: '#ec4899' }}>BTW Vrijstelling</strong>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Netto prijzen zichtbaar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-table-container">
        <div className="dashboard-table-header">
          <h2 className="dashboard-table-title">Recente Bestellingen</h2>
          <Link href="/dashboard/b2b/orders" className="dashboard-action-button secondary">
            Alle bestellingen
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
                  <th>Totaal (excl. BTW)</th>
                  <th>Factuur</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>
                      <span className={`status-badge status-badge-${order.status}`}>
                        {order.status === 'pending' && 'In afwachting'}
                        {order.status === 'paid' && 'Betaald'}
                        {order.status === 'processing' && 'In behandeling'}
                        {order.status === 'shipped' && 'Verzonden'}
                        {order.status === 'delivered' && 'Bezorgd'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>€{Number(order.subtotal).toFixed(2)}</td>
                    <td>
                      {order.invoice_number ? (
                        <Link 
                          href={`/dashboard/b2b/invoices/${order.invoice_number}`}
                          style={{ color: '#ec4899' }}
                        >
                          {order.invoice_number}
                        </Link>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Nog geen bestellingen geplaatst.</p>
          </div>
        )}
      </div>
    </div>
  );
}
