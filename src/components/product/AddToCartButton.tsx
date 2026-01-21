'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  const isInStock = product.stock_quantity > 0;
  const maxQuantity = Math.min(product.stock_quantity, 99);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      toast.error('Dit product is uitverkocht');
      return;
    }

    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} toegevoegd aan winkelwagen`);
    openCart();
  };

  return (
    <>
      <div className="product-detail-quantity">
        <span className="product-detail-quantity-label">Aantal:</span>
        <div className="product-detail-quantity-input">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="product-detail-quantity-btn"
            aria-label="Verminder aantal"
          >
            <Minus size={16} />
          </button>
          <span className="product-detail-quantity-value">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= maxQuantity}
            className="product-detail-quantity-btn"
            aria-label="Verhoog aantal"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="product-detail-actions">
        <button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="product-detail-add-button"
        >
          <ShoppingBag size={20} />
          {isInStock ? 'Toevoegen aan winkelmand' : 'Uitverkocht'}
        </button>
        <button className="product-detail-wishlist-button" aria-label="Toevoegen aan verlanglijst">
          <Heart size={20} />
        </button>
      </div>
    </>
  );
}
