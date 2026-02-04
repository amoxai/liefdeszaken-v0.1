'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Edit, Eye, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category: { id: string; name: string } | null;
  images: { id: string; url: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  currentSearch?: string;
  currentSort?: string;
  currentOrder?: string;
  currentCategory?: string;
}

export default function ProductsTable({ 
  products, 
  categories,
  currentSearch = '',
  currentSort = 'created_at',
  currentOrder = 'desc',
  currentCategory = '',
}: ProductsTableProps) {
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
    router.push('/admin/products?' + params.toString());
  };

  return (
    <div className="admin-card">
      <div className="admin-table-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Zoek op naam of SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </form>

        <select 
          value={currentCategory}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) {
              params.set('category', e.target.value);
            } else {
              params.delete('category');
            }
            router.push('/admin/products?' + params.toString());
          }}
          className="admin-select"
        >
          <option value="">Alle categorieen</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Prijs</th>
              <th>Voorraad</th>
              <th>Categorie</th>
              <th>Status</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-info">
                        <span className="admin-product-name">{product.name}</span>
                        {product.sku && (
                          <span className="admin-product-sku">SKU: {product.sku}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-price-cell">
                      <span className="admin-price">EUR {product.price.toFixed(2)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={'admin-stock' + (product.stock_quantity <= 5 ? ' low' : '')}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>{product.category?.name || '-'}</td>
                  <td>
                    <span className={'admin-badge ' + (product.is_active ? 'admin-badge-active' : 'admin-badge-inactive')}>
                      {product.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Link 
                        href={'/products/' + product.slug}
                        className="admin-action-btn"
                        title="Bekijken"
                        target="_blank"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        href={'/admin/products/' + product.id}
                        className="admin-action-btn"
                        title="Bewerken"
                      >
                        <Edit size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="admin-empty-table">
                  <Package size={48} />
                  <p>Geen producten gevonden</p>
                  <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
                    Product toevoegen
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
