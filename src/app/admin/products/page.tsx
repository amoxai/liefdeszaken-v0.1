import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductsTable from '@/components/admin/ProductsTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    order?: string;
    category?: string;
  }>;
}

async function getProducts(searchParams: {
  search?: string;
  sort?: string;
  order?: string;
  category?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      images:product_images(id, url)
    `);

  // Search
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,sku.ilike.%${searchParams.search}%`);
  }

  // Category filter
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category);
  }

  // Sorting
  const sortField = searchParams.sort || 'created_at';
  const sortOrder = searchParams.order === 'asc' ? true : false;
  query = query.order(sortField, { ascending: sortOrder });

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products || [];
}

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
  
  return data || [];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  return (
    <div className="admin-page">
      <AdminHeader 
        title="Producten" 
        subtitle={`${products.length} producten gevonden`}
      />

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus size={18} />
            Nieuw Product
          </Link>
        </div>
      </div>

      <ProductsTable 
        products={products} 
        categories={categories}
        currentSearch={params.search}
        currentSort={params.sort}
        currentOrder={params.order}
        currentCategory={params.category}
      />
    </div>
  );
}
