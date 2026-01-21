'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import type { Category } from '@/types';

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category');
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || inStock;

  return (
    <div className="product-filters">
      <h3 className="product-filters-title">
        <Filter size={20} />
        Filters
      </h3>

      {/* Categories */}
      <div className="product-filter-group">
        <label className="product-filter-label">Categorie</label>
        <div className="product-filter-options">
          <label className="product-filter-option">
            <input
              type="radio"
              name="category"
              checked={!currentCategory}
              onChange={() => updateFilter('category', null)}
            />
            <span>Alle categorieen</span>
          </label>
          {categories.map((category) => (
            <label key={category.id} className="product-filter-option">
              <input
                type="radio"
                name="category"
                checked={currentCategory === category.slug}
                onChange={() => updateFilter('category', category.slug)}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="product-filter-group">
        <label className="product-filter-label">Prijs</label>
        <div className="product-filter-price-range">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value || null)}
            className="product-filter-price-input"
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
            className="product-filter-price-input"
            min="0"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="product-filter-group">
        <label className="product-filter-label">Beschikbaarheid</label>
        <div className="product-filter-options">
          <label className="product-filter-option">
            <input
              type="checkbox"
              checked={inStock === 'true'}
              onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
            />
            <span>Alleen op voorraad</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button onClick={clearFilters} className="product-filter-clear">
          <X size={16} />
          Filters wissen
        </button>
      )}
    </div>
  );
}
