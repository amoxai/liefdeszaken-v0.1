import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AddToCartButton from '@/components/product/AddToCartButton';
import type { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  return data as Product | null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product niet gevonden',
    };
  }

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || product.description,
    openGraph: {
      title: product.name,
      description: product.short_description || product.description || '',
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id: slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const isInStock = product.stock_quantity > 0;

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <nav className="product-detail-breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products">Producten</Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link href={`/products?category=${product.category.slug}`}>
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-detail-gallery">
            <div className="product-detail-main-image">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt_text || product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f3f4f6',
                  color: '#9ca3af'
                }}>
                  Geen afbeelding
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="product-detail-thumbnails">
                {product.images.map((image, index) => (
                  <div key={image.id} className={`product-detail-thumbnail ${index === 0 ? 'active' : ''}`}>
                    <Image
                      src={image.url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            {product.category && (
              <span className="product-detail-category">{product.category.name}</span>
            )}
            
            <h1 className="product-detail-title">{product.name}</h1>

            <div className="product-detail-price">
              <span className="product-detail-price-current">
                €{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <>
                  <span className="product-detail-price-original">
                    €{product.compare_at_price.toFixed(2)}
                  </span>
                  <span className="product-detail-price-discount">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            <div className={`product-detail-stock ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
              {isInStock ? (
                <>
                  <Check size={18} />
                  <span>Op voorraad ({product.stock_quantity} beschikbaar)</span>
                </>
              ) : (
                <>
                  <X size={18} />
                  <span>Niet op voorraad</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="product-detail-description">{product.description}</p>
            )}

            <AddToCartButton product={product} />

            {/* Meta Info */}
            <div className="product-detail-meta">
              {product.sku && (
                <div className="product-detail-meta-item">
                  <span className="product-detail-meta-label">SKU:</span>
                  <span className="product-detail-meta-value">{product.sku}</span>
                </div>
              )}
              {product.category && (
                <div className="product-detail-meta-item">
                  <span className="product-detail-meta-label">Categorie:</span>
                  <span className="product-detail-meta-value">
                    <Link href={`/products?category=${product.category.slug}`} style={{ color: '#ec4899' }}>
                      {product.category.name}
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
