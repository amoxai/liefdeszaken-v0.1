'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Package, Plus, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category: { name: string }[] | null;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, sku, price, stock_quantity, is_active, is_featured, created_at,
        category:categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Kon producten niet laden');
    } else {
      setProducts((data as Product[]) || []);
    }
    
    setIsLoading(false);
  };

  const toggleActive = async (productId: string, currentState: boolean) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentState })
      .eq('id', productId);

    if (error) {
      toast.error('Kon product niet bijwerken');
    } else {
      toast.success(currentState ? 'Product gedeactiveerd' : 'Product geactiveerd');
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !currentState } : p))
      );
    }
  };

  const toggleFeatured = async (productId: string, currentState: boolean) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .update({ is_featured: !currentState })
      .eq('id', productId);

    if (error) {
      toast.error('Kon product niet bijwerken');
    } else {
      toast.success(currentState ? 'Uitgelicht verwijderd' : 'Product uitgelicht');
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_featured: !currentState } : p))
      );
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast.error('Kon product niet verwijderen');
    } else {
      toast.success('Product verwijderd');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const filteredProducts = filter === 'all'
    ? products
    : filter === 'active'
    ? products.filter((p) => p.is_active)
    : products.filter((p) => !p.is_active);

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="dashboard-page-title">Producten Beheer</h1>
        <Link href="/dashboard/admin/products/new" className="dashboard-action-button">
          <Plus size={18} />
          Nieuw Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilter('all')}
          className={`dashboard-action-button ${filter === 'all' ? '' : 'secondary'}`}
        >
          Alle ({products.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`dashboard-action-button ${filter === 'active' ? '' : 'secondary'}`}
        >
          Actief ({products.filter((p) => p.is_active).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`dashboard-action-button ${filter === 'inactive' ? '' : 'secondary'}`}
        >
          Inactief ({products.filter((p) => !p.is_active).length})
        </button>
      </div>

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Categorie</th>
                <th>Prijs</th>
                <th>Voorraad</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{product.name}</span>
                      {product.is_featured && (
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      )}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {product.sku || '-'}
                  </td>
                  <td>{product.category?.[0]?.name || '-'}</td>
                  <td style={{ fontWeight: 600 }}>EUR {Number(product.price).toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      color: product.stock_quantity === 0 ? '#ef4444' : 
                             product.stock_quantity < 10 ? '#f59e0b' : '#22c55e'
                    }}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'status-badge-paid' : 'status-badge-cancelled'}`}>
                      {product.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Link
                        href={`/dashboard/admin/products/${product.id}`}
                        className="dashboard-icon-button"
                        title="Bewerken"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => toggleActive(product.id, product.is_active)}
                        className="dashboard-icon-button"
                        title={product.is_active ? 'Deactiveren' : 'Activeren'}
                      >
                        {product.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => toggleFeatured(product.id, product.is_featured)}
                        className="dashboard-icon-button"
                        title={product.is_featured ? 'Verwijder uit uitgelicht' : 'Uitlichten'}
                        style={{ color: product.is_featured ? '#f59e0b' : undefined }}
                      >
                        <Star size={16} fill={product.is_featured ? '#f59e0b' : 'none'} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="dashboard-icon-button danger"
                        title="Verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Geen producten gevonden.</p>
            <Link href="/dashboard/admin/products/new" className="dashboard-action-button" style={{ marginTop: '1rem' }}>
              Product toevoegen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
