'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, low_stock_threshold, price')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Kon producten niet laden');
    } else {
      setProducts(data || []);
    }
    
    setIsLoading(false);
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditStock(product.stock_quantity);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStock(0);
  };

  const saveStock = async (productId: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: editStock })
      .eq('id', productId);

    if (error) {
      toast.error('Kon voorraad niet bijwerken');
    } else {
      toast.success('Voorraad bijgewerkt');
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock_quantity: editStock } : p
        )
      );
      setEditingId(null);
    }
  };

  const filteredProducts = filter === 'low'
    ? products.filter((p) => p.stock_quantity <= p.low_stock_threshold)
    : products;

  const lowStockCount = products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length;

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="dashboard-page-title">Voorraad Beheer</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('all')}
            className={`dashboard-action-button ${filter === 'all' ? '' : 'secondary'}`}
          >
            Alle ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`dashboard-action-button ${filter === 'low' ? '' : 'secondary'}`}
          >
            <AlertTriangle size={16} />
            Laag ({lowStockCount})
          </button>
        </div>
      </div>

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Voorraad</th>
                <th>Drempel</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity <= product.low_stock_threshold;
                const isEditing = editingId === product.id;

                return (
                  <tr key={product.id}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{product.name}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {product.sku || '-'}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                          className="form-input"
                          style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                          min="0"
                        />
                      ) : (
                        <span style={{ 
                          fontWeight: 600,
                          color: isLowStock ? '#ef4444' : '#1f2937'
                        }}>
                          {product.stock_quantity}
                        </span>
                      )}
                    </td>
                    <td>{product.low_stock_threshold}</td>
                    <td>
                      {product.stock_quantity === 0 ? (
                        <span className="status-badge status-badge-cancelled">Uitverkocht</span>
                      ) : isLowStock ? (
                        <span className="status-badge status-badge-pending">Laag</span>
                      ) : (
                        <span className="status-badge status-badge-paid">Op voorraad</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => saveStock(product.id)}
                            className="dashboard-icon-button"
                            title="Opslaan"
                            style={{ color: '#22c55e' }}
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="dashboard-icon-button danger"
                            title="Annuleren"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(product)}
                          className="dashboard-icon-button"
                          title="Bewerken"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Geen producten gevonden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
