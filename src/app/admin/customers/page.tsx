import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import CustomersTable from '@/components/admin/CustomersTable';
import Link from 'next/link';

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    sort?: string;
  }>;
}

async function getCustomers(searchParams: {
  search?: string;
  type?: string;
  sort?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('profiles')
    .select('*')
    .in('role', ['consumer', 'b2b']);

  // Filter by type
  if (searchParams.type === 'b2c') {
    query = query.eq('role', 'consumer');
  } else if (searchParams.type === 'b2b') {
    query = query.eq('role', 'b2b');
  }

  // Search
  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%,company_name.ilike.%${searchParams.search}%`);
  }

  // Sorting
  query = query.order('created_at', { ascending: false });

  const { data: customers, error } = await query;

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return customers || [];
}

async function getCustomerStats() {
  const supabase = await createClient();
  
  const { count: b2cCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'consumer');

  const { count: b2bCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'b2b');

  return {
    b2c: b2cCount || 0,
    b2b: b2bCount || 0,
    total: (b2cCount || 0) + (b2bCount || 0),
  };
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const [customers, stats] = await Promise.all([
    getCustomers(params),
    getCustomerStats(),
  ]);

  return (
    <div className="admin-page">
      <AdminHeader 
        title="Klanten" 
        subtitle={`${stats.total} klanten in totaal`}
      />

      {/* Stats */}
      <div className="admin-customer-stats">
        <Link 
          href="/admin/customers" 
          className={`admin-stat-tab ${!params.type ? 'active' : ''}`}
        >
          <span className="admin-stat-tab-count">{stats.total}</span>
          <span className="admin-stat-tab-label">Alle Klanten</span>
        </Link>
        <Link 
          href="/admin/customers?type=b2c" 
          className={`admin-stat-tab ${params.type === 'b2c' ? 'active' : ''}`}
        >
          <span className="admin-stat-tab-count">{stats.b2c}</span>
          <span className="admin-stat-tab-label">B2C Klanten</span>
        </Link>
        <Link 
          href="/admin/customers?type=b2b" 
          className={`admin-stat-tab ${params.type === 'b2b' ? 'active' : ''}`}
        >
          <span className="admin-stat-tab-count">{stats.b2b}</span>
          <span className="admin-stat-tab-label">B2B Klanten</span>
        </Link>
      </div>

      <CustomersTable 
        customers={customers}
        currentSearch={params.search}
        currentType={params.type}
      />
    </div>
  );
}
