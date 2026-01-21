import { Suspense } from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';
import type { Product, Category } from '@/types';

export const metadata: Metadata = {
  title: 'Producten',
  description: 'Bekijk onze volledige collectie producten. Filter op categorie, prijs en meer.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    featured?: string;
  }>;
}

async function getProducts(searchParams: {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: string;
}): Promise<Product[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('is_active', true);

  // Filter by category
  if (searchParams.category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single();
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  // Search
  if (searchParams.search) {
    query = query.ilike('name', `%${searchParams.search}%`);
  }

  // Price filters
  if (searchParams.minPrice) {
    query = query.gte('price', parseFloat(searchParams.minPrice));
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseFloat(searchParams.maxPrice));
  }

  // Featured only
  if (searchParams.featured === 'true') {
    query = query.eq('is_featured', true);
  }

  // Sorting
  switch (searchParams.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data } = await query.limit(50);
  return (data as Product[]) || [];
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  return (data as Category[]) || [];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <h1 className="products-title">
            {params.featured === 'true' ? 'Aanbiedingen' : 
             params.search ? `Zoekresultaten voor "${params.search}"` : 
             'Alle Producten'}
          </h1>
          <p className="products-count">{products.length} producten gevonden</p>
        </div>

        <div className="products-layout">
          <aside>
            <Suspense fallback={<div>Laden...</div>}>
              <ProductFilters categories={categories} />
            </Suspense>
          </aside>

          <div>
            <div className="products-toolbar">
              <div className="product-sort">
                <label className="product-sort-label">Sorteren op:</label>
                <form>
                  <select 
                    name="sort" 
                    className="product-sort-select"
                    defaultValue={params.sort || 'newest'}
                  >
                    <option value="newest">Nieuwste</option>
                    <option value="price_asc">Prijs: Laag naar Hoog</option>
                    <option value="price_desc">Prijs: Hoog naar Laag</option>
                    <option value="name">Naam (A-Z)</option>
                  </select>
                </form>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                background: 'white',
                borderRadius: '1rem'
              }}>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Geen producten gevonden met de huidige filters.
                </p>
                <a href="/products" style={{ color: '#ec4899' }}>
                  Bekijk alle producten
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
