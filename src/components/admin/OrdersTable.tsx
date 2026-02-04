'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Eye, Package, Check } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  guest_email: string | null;
  user: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
  } | null;
}

interface OrdersTableProps {
  orders: Order[];
  currentSearch?: string;
  currentStatus?: string;
}

export default function OrdersTable({ 
  orders, 
  currentSearch = '',
  currentStatus = '',
}: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  const getCustomerName = (order: Order) => {
    if (order.user) {
      if (order.user.company_name) return order.user.company_name;
      if (order.user.first_name || order.user.last_name) {
        return `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim();
      }
      return order.user.email;
    }
    return order.guest_email || 'Gast';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Nieuw',
      paid: 'Betaald',
      processing: 'In Behandeling',
      shipped: 'Verzonden',
      delivered: 'Geleverd',
      cancelled: 'Geannuleerd',
      refunded: 'Terugbetaald',
    };
    return labels[status] || status;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-table-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Zoek op ordernummer of email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Klant</th>
              <th>Status</th>
              <th>Betaling</th>
              <th>Totaal</th>
              <th>Datum</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="admin-link font-medium">
                      {order.order_number}
                    </Link>
                  </td>
                  <td>{getCustomerName(order)}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-payment-${order.payment_status}`}>
                      {order.payment_status === 'paid' ? 'Betaald' : 
                       order.payment_status === 'pending' ? 'In Afwachting' :
                       order.payment_status === 'failed' ? 'Mislukt' :
                       order.payment_status === 'refunded' ? 'Terugbetaald' : order.payment_status}
                    </span>
                  </td>
                  <td className="font-medium">EUR {order.total.toFixed(2)}</td>
                  <td className="text-muted">
                    {new Date(order.created_at).toLocaleDateString('nl-NL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="admin-action-btn"
                        title="Bekijken"
                      >
                        <Eye size={16} />
                      </Link>
                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="admin-action-btn"
                          title="Markeer als verzonden"
                        >
                          <Package size={16} />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="admin-action-btn"
                          title="Markeer als geleverd"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="admin-empty-table">
                  <Package size={48} />
                  <p>Geen bestellingen gevonden</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
