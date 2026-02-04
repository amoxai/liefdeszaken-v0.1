import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import OrdersTable from '@/components/admin/OrdersTable';

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    payment?: string;
  }>;
}

async function getOrders(searchParams: {
  search?: string;
  status?: string;
  payment?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      user:profiles(email, first_name, last_name, company_name)
    `)
    .order('created_at', { ascending: false });

  // Filter by status
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  // Filter by payment status
  if (searchParams.payment) {
    query = query.eq('payment_status', searchParams.payment);
  }

  // Search
  if (searchParams.search) {
    query = query.or(`order_number.ilike.%${searchParams.search}%,guest_email.ilike.%${searchParams.search}%`);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return orders || [];
}

async function getOrderStats() {
  const supabase = await createClient();
  
  const { count: pending } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: processing } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  const { count: shipped } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'shipped');

  const { count: delivered } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'delivered');

  return {
    pending: pending || 0,
    processing: processing || 0,
    shipped: shipped || 0,
    delivered: delivered || 0,
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const [orders, stats] = await Promise.all([
    getOrders(params),
    getOrderStats(),
  ]);

  return (
    <div className="admin-page">
      <AdminHeader 
        title="Bestellingen" 
        subtitle={`${orders.length} bestellingen gevonden`}
      />

      {/* Status Tabs */}
      <div className="admin-order-stats">
        <a 
          href="/admin/orders" 
          className={`admin-order-stat ${!params.status ? 'active' : ''}`}
        >
          <span className="admin-order-stat-count">Alle</span>
        </a>
        <a 
          href="/admin/orders?status=pending" 
          className={`admin-order-stat pending ${params.status === 'pending' ? 'active' : ''}`}
        >
          <span className="admin-order-stat-count">{stats.pending}</span>
          <span className="admin-order-stat-label">Nieuw</span>
        </a>
        <a 
          href="/admin/orders?status=processing" 
          className={`admin-order-stat processing ${params.status === 'processing' ? 'active' : ''}`}
        >
          <span className="admin-order-stat-count">{stats.processing}</span>
          <span className="admin-order-stat-label">In Behandeling</span>
        </a>
        <a 
          href="/admin/orders?status=shipped" 
          className={`admin-order-stat shipped ${params.status === 'shipped' ? 'active' : ''}`}
        >
          <span className="admin-order-stat-count">{stats.shipped}</span>
          <span className="admin-order-stat-label">Verzonden</span>
        </a>
        <a 
          href="/admin/orders?status=delivered" 
          className={`admin-order-stat delivered ${params.status === 'delivered' ? 'active' : ''}`}
        >
          <span className="admin-order-stat-count">{stats.delivered}</span>
          <span className="admin-order-stat-label">Geleverd</span>
        </a>
      </div>

      <OrdersTable 
        orders={orders}
        currentSearch={params.search}
        currentStatus={params.status}
      />
    </div>
  );
}
