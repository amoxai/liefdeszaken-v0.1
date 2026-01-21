import Link from 'next/link';
import { Package, AlertTriangle, Clock, Truck, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function getEmployeeDashboardData() {
  const supabase = await createClient();

  // Get order counts by status
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: paidOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid');

  const { count: processingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  const { count: shippedToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'shipped')
    .gte('updated_at', new Date().toISOString().split('T')[0]);

  // Get low stock alerts
  const { data: stockAlerts } = await supabase
    .from('stock_alerts')
    .select(`
      *,
      product:products(name, sku, stock_quantity)
    `)
    .eq('is_acknowledged', false)
    .limit(5);

  // Get recent orders to process
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['paid', 'processing'])
    .order('created_at', { ascending: true })
    .limit(10);

  return {
    pendingOrders: pendingOrders || 0,
    paidOrders: paidOrders || 0,
    processingOrders: processingOrders || 0,
    shippedToday: shippedToday || 0,
    stockAlerts: stockAlerts || [],
    recentOrders: recentOrders || [],
  };
}

export default async function EmployeeDashboardPage() {
  const data = await getEmployeeDashboardData();

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Werknemers Dashboard
      </h1>

      {/* Stats */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon yellow">
              <Clock size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.pendingOrders}</div>
          <div className="dashboard-stat-label">In Afwachting</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon green">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.paidOrders}</div>
          <div className="dashboard-stat-label">Betaald (Te Verwerken)</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon blue">
              <Package size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.processingOrders}</div>
          <div className="dashboard-stat-label">In Behandeling</div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon pink">
              <Truck size={24} />
            </div>
          </div>
          <div className="dashboard-stat-value">{data.shippedToday}</div>
          <div className="dashboard-stat-label">Vandaag Verzonden</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {data.stockAlerts.length > 0 && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #f59e0b',
          borderRadius: '0.75rem', 
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#92400e' }}>Voorraad Waarschuwingen</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              {data.stockAlerts.map((alert) => (
                <li key={alert.id} style={{ color: '#92400e', fontSize: '0.9rem' }}>
                  {alert.product?.name} (SKU: {alert.product?.sku}) - 
                  Nog {alert.current_stock} op voorraad
                </li>
              ))}
            </ul>
            <Link 
              href="/dashboard/employee/inventory" 
              style={{ color: '#d97706', fontSize: '0.875rem', fontWeight: 500 }}
            >
              Bekijk voorraad ?
            </Link>
          </div>
        </div>
      )}

      {/* Orders to Process */}
      <div className="dashboard-table-container">
        <div className="dashboard-table-header">
          <h2 className="dashboard-table-title">Te Verwerken Orders</h2>
          <Link href="/dashboard/employee/orders" className="dashboard-action-button secondary">
            Alle orders
          </Link>
        </div>

        {data.recentOrders.length > 0 ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Bestelnummer</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Totaal</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>
                      <span className={`status-badge status-badge-${order.status}`}>
                        {order.status === 'paid' && 'Betaald'}
                        {order.status === 'processing' && 'In behandeling'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>�{Number(order.total).toFixed(2)}</td>
                    <td>
                      <Link
                        href={`/dashboard/employee/orders/${order.id}`}
                        className="dashboard-action-button"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Verwerken
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: '#22c55e' }} />
            <p>Alle orders zijn verwerkt! ??</p>
          </div>
        )}
      </div>
    </div>
  );
}
