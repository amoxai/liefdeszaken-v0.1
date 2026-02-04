'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Save, Package, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  category: { name: string } | null;
}

interface InventoryTableProps {
  products: Product[];
}

export default function InventoryTable({ products: initialProducts }: InventoryTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [saving, setSaving] = useState(false);

  const filteredProducts = products.filter(p => {
    // Search filter
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    // Stock filter
    let matchesFilter = true;
    if (filter === 'low') {
      matchesFilter = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
    } else if (filter === 'out') {
      matchesFilter = p.stock_quantity === 0;
    }

    return matchesSearch && matchesFilter;
  });

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.stock_quantity);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const saveStock = async (productId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: editValue }),
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, stock_quantity: editValue } : p
        ));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
    setSaving(false);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return 'out';
    if (product.stock_quantity <= product.low_stock_threshold) return 'low';
    return 'ok';
  };

  return (
    <div className="admin-card">
      {/* Filters */}
      <div className="admin-table-filters">
        <div className="admin-search-form">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Zoek op naam of SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-tabs">
          <button 
            className={`admin-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
          <button 
            className={`admin-filter-tab ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Lage Voorraad
          </button>
          <button 
            className={`admin-filter-tab ${filter === 'out' ? 'active' : ''}`}
            onClick={() => setFilter('out')}
          >
            Uitverkocht
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Categorie</th>
              <th>Voorraad</th>
              <th>Drempel</th>
              <th>Status</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const status = getStockStatus(product);
                return (
                  <tr key={product.id} className={status !== 'ok' ? 'highlight-row' : ''}>
                    <td>
                      <Link href={`/admin/products/${product.id}`} className="admin-link">
                        {product.name}
                      </Link>
                    </td>
                    <td className="text-muted">{product.sku || '-'}</td>
                    <td>{product.category?.name || '-'}</td>
                    <td>
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="admin-inline-input"
                          min="0"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={`admin-stock-value ${status}`}
                          onClick={() => startEditing(product)}
                        >
                          {product.stock_quantity}
                        </span>
                      )}
                    </td>
                    <td className="text-muted">{product.low_stock_threshold}</td>
                    <td>
                      <span className={`admin-badge admin-badge-stock-${status}`}>
                        {status === 'out' && (
                          <>
                            <AlertTriangle size={12} />
                            Uitverkocht
                          </>
                        )}
                        {status === 'low' && (
                          <>
                            <AlertTriangle size={12} />
                            Lage Voorraad
                          </>
                        )}
                        {status === 'ok' && 'Op Voorraad'}
                      </span>
                    </td>
                    <td>
                      {editingId === product.id ? (
                        <div className="admin-actions">
                          <button 
                            onClick={() => saveStock(product.id)}
                            className="admin-btn admin-btn-sm admin-btn-primary"
                            disabled={saving}
                          >
                            <Save size={14} />
                          </button>
                          <button 
                            onClick={cancelEditing}
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                          >
                            ?
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEditing(product)}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          Bijwerken
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="admin-empty-table">
                  <Package size={48} />
                  <p>Geen producten gevonden</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
