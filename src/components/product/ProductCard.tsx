'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { getProductImageUrl } from '@/lib/storage';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

// Helper to get full image URL (supports both storage paths and full URLs)
function getImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return getProductImageUrl(url);
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast.error('Dit product is uitverkocht');
      return;
    }
    addItem(product);
    toast.success('Toegevoegd aan winkelwagen');
  };

  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const isOutOfStock = product.stock_quantity <= 0;

  // Get the first image URL
  const imageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0].url) 
    : null;

  return (
    <div className="product-card">
      <div className="product-card-image-wrapper">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.images?.[0]?.alt_text || product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card-image"
          />
        ) : (
          <div className="product-card-image" style={{ background: '#f3f4f6' }} />
        )}

        <div className="product-card-badges">
          {discountPercentage && (
            <span className="product-badge product-badge-sale">
              -{discountPercentage}%
            </span>
          )}
          {product.is_featured && (
            <span className="product-badge product-badge-featured">
              Uitgelicht
            </span>
          )}
          {isOutOfStock && (
            <span className="product-badge product-badge-out-of-stock">
              Uitverkocht
            </span>
          )}
        </div>

        <button
          className="product-card-wishlist"
          aria-label="Toevoegen aan verlanglijst"
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="product-card-content">
        {product.category && (
          <span className="product-card-category">{product.category.name}</span>
        )}

        <h3 className="product-card-title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`product-rating-star ${i < 4 ? '' : 'empty'}`}
              fill={i < 4 ? 'currentColor' : 'none'}
            />
          ))}
          <span className="product-rating-count">(24)</span>
        </div>

        <div className="product-card-price">
          <span className="product-card-price-current">
            �{product.price.toFixed(2)}
          </span>
          {product.compare_at_price && (
            <>
              <span className="product-card-price-original">
                �{product.compare_at_price.toFixed(2)}
              </span>
              <span className="product-card-price-discount">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>

        <div className="product-card-actions">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="product-card-add-button"
          >
            <ShoppingBag size={18} />
            {isOutOfStock ? 'Uitverkocht' : 'In winkelmand'}
          </button>
          {showQuickView && (
            <button className="product-card-quick-view" aria-label="Quick view">
              <Eye size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
