'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Gift } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    getLoyaltyPointsToEarn,
  } = useCartStore();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const itemCount = getItemCount();
  const loyaltyPoints = getLoyaltyPointsToEarn();

  return (
    <>
      <div
        className={`cart-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h2 className="cart-sidebar-title">
            <ShoppingBag size={22} />
            Winkelwagen
            {itemCount > 0 && (
              <span className="cart-sidebar-count">{itemCount}</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="cart-sidebar-close"
            aria-label="Sluiten"
          >
            <X size={22} />
          </button>
        </div>

        <div className="cart-sidebar-content">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={32} />
              </div>
              <h3 className="cart-empty-title">Je winkelwagen is leeg</h3>
              <p className="cart-empty-text">
                Ontdek onze producten en vul je winkelwagen
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="cart-empty-button"
              >
                Bekijk producten
              </Link>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="cart-item-image"
                    />
                  ) : (
                    <div
                      className="cart-item-image"
                      style={{ background: '#f3f4f6' }}
                    />
                  )}

                  <div className="cart-item-content">
                    <h4 className="cart-item-title">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeCart}
                      >
                        {item.product.name}
                      </Link>
                    </h4>
                    <span className="cart-item-price">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>

                    <div className="cart-item-actions">
                      <div className="cart-item-quantity">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          className="cart-item-quantity-btn"
                          aria-label="Verminder aantal"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-item-quantity-value">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          className="cart-item-quantity-btn"
                          aria-label="Verhoog aantal"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="cart-item-remove"
                        aria-label="Verwijderen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-summary">
              <div className="cart-summary-row subtotal">
                <span>Subtotaal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row tax">
                <span>BTW (21%)</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row total">
                <span>Totaal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-loyalty-preview">
              <Gift size={18} />
              <span>
                Je verdient <strong>{loyaltyPoints} punten</strong> met deze
                bestelling!
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="cart-checkout-button"
            >
              Afrekenen
            </Link>

            <Link
              href="/products"
              onClick={closeCart}
              className="cart-continue-shopping"
            >
              Verder winkelen
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
