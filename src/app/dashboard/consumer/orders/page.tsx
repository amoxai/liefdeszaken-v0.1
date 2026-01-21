import Link from 'next/link';
import { Package, Eye, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function getOrders() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return orders || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Mijn Bestellingen
      </h1>

      <div className="dashboard-table-container">
        {orders.length > 0 ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Bestelnummer</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Betaalstatus</th>
                  <th>Totaal</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{order.order_number}</span>
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
                        {order.status === 'refunded' && 'Terugbetaald'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-badge-${order.payment_status}`}>
                        {order.payment_status === 'pending' && 'In afwachting'}
                        {order.payment_status === 'paid' && 'Betaald'}
                        {order.payment_status === 'failed' && 'Mislukt'}
                        {order.payment_status === 'refunded' && 'Terugbetaald'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>€{Number(order.total).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          href={`/dashboard/consumer/orders/${order.id}`}
                          className="dashboard-icon-button"
                          title="Bekijken"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          className="dashboard-icon-button"
                          title="Opnieuw bestellen"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ marginBottom: '1rem' }}>Je hebt nog geen bestellingen geplaatst.</p>
            <Link href="/products" className="dashboard-action-button">
              Bekijk producten
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
