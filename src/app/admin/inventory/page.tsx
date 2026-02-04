import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import InventoryTable from '@/components/admin/InventoryTable';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';

async function getInventoryData() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      sku,
      stock_quantity,
      low_stock_threshold,
      is_active,
      category:categories(name)
    `)
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true });

  if (error) {
    console.error('Error fetching inventory:', error);
    return { products: [], stats: { total: 0, lowStock: 0, outOfStock: 0, inStock: 0 } };
  }

  // Transform the data to match the expected interface
  const prods = (products || []).map(p => {
    let cat: { name: string } | null = null;
    if (Array.isArray(p.category) && p.category.length > 0) {
      cat = p.category[0];
    } else if (p.category && !Array.isArray(p.category)) {
      cat = p.category as unknown as { name: string };
    }
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      is_active: p.is_active,
      category: cat
    };
  });
  
  const stats = {
    total: prods.length,
    outOfStock: prods.filter(p => p.stock_quantity === 0).length,
    lowStock: prods.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length,
    inStock: prods.filter(p => p.stock_quantity > p.low_stock_threshold).length,
  };

  return { products: prods, stats };
}

export default async function InventoryPage() {
  const { products, stats } = await getInventoryData();

  return (
    <div className="admin-page">
      <AdminHeader 
        title="Voorraad Beheer" 
        subtitle="Beheer je productvoorraad en ontvang meldingen bij lage voorraad"
      />

      {/* Stats */}
      <div className="admin-inventory-stats">
        <div className="admin-inventory-stat">
          <Package size={24} />
          <div>
            <span className="admin-inventory-stat-value">{stats.total}</span>
            <span className="admin-inventory-stat-label">Totaal Producten</span>
          </div>
        </div>
        <div className="admin-inventory-stat in-stock">
          <CheckCircle size={24} />
          <div>
            <span className="admin-inventory-stat-value">{stats.inStock}</span>
            <span className="admin-inventory-stat-label">Op Voorraad</span>
          </div>
        </div>
        <div className="admin-inventory-stat low-stock">
          <AlertTriangle size={24} />
          <div>
            <span className="admin-inventory-stat-value">{stats.lowStock}</span>
            <span className="admin-inventory-stat-label">Lage Voorraad</span>
          </div>
        </div>
        <div className="admin-inventory-stat out-of-stock">
          <AlertTriangle size={24} />
          <div>
            <span className="admin-inventory-stat-value">{stats.outOfStock}</span>
            <span className="admin-inventory-stat-label">Uitverkocht</span>
          </div>
        </div>
      </div>

      <InventoryTable products={products} />
    </div>
  );
}
