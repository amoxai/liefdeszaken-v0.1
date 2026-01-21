'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Gift, User, UserX, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import toast from 'react-hot-toast';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingStreet: string;
  shippingHouseNumber: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
  billingStreet: string;
  billingHouseNumber: string;
  billingPostalCode: string;
  billingCity: string;
  billingCountry: string;
  sameAsShipping: boolean;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getTotal, getLoyaltyPointsToEarn, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login'>(
    isAuthenticated ? 'login' : 'guest'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    shippingStreet: '',
    shippingHouseNumber: '',
    shippingPostalCode: '',
    shippingCity: '',
    shippingCountry: 'Nederland',
    billingStreet: '',
    billingHouseNumber: '',
    billingPostalCode: '',
    billingCity: '',
    billingCountry: 'Nederland',
    sameAsShipping: true,
    notes: '',
  });

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const shippingCost = subtotal >= 50 ? 0 : 4.95;
  const finalTotal = total + shippingCost;
  const loyaltyPoints = getLoyaltyPointsToEarn();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Je winkelwagen is leeg');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order via API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product_id,
            productName: item.product.name,
            productSku: item.product.sku,
            quantity: item.quantity,
            price: item.price,
          })),
          customer: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          },
          shippingAddress: {
            street: formData.shippingStreet,
            houseNumber: formData.shippingHouseNumber,
            postalCode: formData.shippingPostalCode,
            city: formData.shippingCity,
            country: formData.shippingCountry,
          },
          billingAddress: formData.sameAsShipping
            ? {
                street: formData.shippingStreet,
                houseNumber: formData.shippingHouseNumber,
                postalCode: formData.shippingPostalCode,
                city: formData.shippingCity,
                country: formData.shippingCountry,
              }
            : {
                street: formData.billingStreet,
                houseNumber: formData.billingHouseNumber,
                postalCode: formData.billingPostalCode,
                city: formData.billingCity,
                country: formData.billingCountry,
              },
          notes: formData.notes,
          subtotal,
          tax,
          shippingCost,
          total: finalTotal,
          isGuest: checkoutMode === 'guest',
          userId: isAuthenticated ? user?.id : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er ging iets mis');
      }

      // Redirect to Stripe checkout or success page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Je winkelwagen is leeg</h1>
            <Link href="/products" className="hero-button-primary">
              Bekijk producten
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1 className="checkout-title">Afrekenen</h1>
        </div>

        <div className="checkout-grid">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Guest / Login Toggle */}
              {!isAuthenticated && (
                <div className="checkout-form-section">
                  <h2 className="checkout-section-title">
                    <span className="checkout-section-number">1</span>
                    Hoe wil je afrekenen?
                  </h2>
                  <div className="checkout-guest-login">
                    <button
                      type="button"
                      onClick={() => setCheckoutMode('guest')}
                      className={`checkout-guest-login-button ${checkoutMode === 'guest' ? 'active' : ''}`}
                    >
                      <UserX size={18} style={{ marginRight: '0.5rem' }} />
                      Als gast
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/login?redirect=/checkout')}
                      className={`checkout-guest-login-button ${checkoutMode === 'login' ? 'active' : ''}`}
                    >
                      <User size={18} style={{ marginRight: '0.5rem' }} />
                      Inloggen
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="checkout-form-section">
                <h2 className="checkout-section-title">
                  <span className="checkout-section-number">{isAuthenticated ? 1 : 2}</span>
                  Contactgegevens
                </h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Voornaam *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Achternaam *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">E-mailadres *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefoonnummer</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="checkout-form-section">
                <h2 className="checkout-section-title">
                  <span className="checkout-section-number">{isAuthenticated ? 2 : 3}</span>
                  Bezorgadres
                </h2>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Straat *</label>
                    <input
                      type="text"
                      name="shippingStreet"
                      value={formData.shippingStreet}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Huisnummer *</label>
                    <input
                      type="text"
                      name="shippingHouseNumber"
                      value={formData.shippingHouseNumber}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Postcode *</label>
                    <input
                      type="text"
                      name="shippingPostalCode"
                      value={formData.shippingPostalCode}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Plaats *</label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Land</label>
                  <select
                    name="shippingCountry"
                    value={formData.shippingCountry}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Nederland">Nederland</option>
                    <option value="België">België</option>
                    <option value="Duitsland">Duitsland</option>
                  </select>
                </div>
              </div>

              {/* Billing Address */}
              <div className="checkout-form-section">
                <h2 className="checkout-section-title">
                  <span className="checkout-section-number">{isAuthenticated ? 3 : 4}</span>
                  Factuuradres
                </h2>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Hetzelfde als bezorgadres</span>
                  </label>
                </div>

                {!formData.sameAsShipping && (
                  <>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Straat *</label>
                        <input
                          type="text"
                          name="billingStreet"
                          value={formData.billingStreet}
                          onChange={handleChange}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Huisnummer *</label>
                        <input
                          type="text"
                          name="billingHouseNumber"
                          value={formData.billingHouseNumber}
                          onChange={handleChange}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Postcode *</label>
                        <input
                          type="text"
                          name="billingPostalCode"
                          value={formData.billingPostalCode}
                          onChange={handleChange}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Plaats *</label>
                        <input
                          type="text"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
              <div className="checkout-form-section">
                <h2 className="checkout-section-title">
                  <span className="checkout-section-number">{isAuthenticated ? 4 : 5}</span>
                  Opmerkingen (optioneel)
                </h2>
                <div className="form-group">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="form-input"
                    rows={3}
                    placeholder="Speciale instructies voor je bestelling..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="checkout-order-summary">
              <h3 className="checkout-order-summary-title">Besteloverzicht</h3>

              <div className="checkout-order-items">
                {items.map((item) => (
                  <div key={item.id} className="checkout-order-item">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="checkout-order-item-image"
                      />
                    ) : (
                      <div
                        className="checkout-order-item-image"
                        style={{ background: '#f3f4f6', width: 64, height: 64 }}
                      />
                    )}
                    <div className="checkout-order-item-details">
                      <p className="checkout-order-item-name">{item.product.name}</p>
                      <p className="checkout-order-item-quantity">Aantal: {item.quantity}</p>
                    </div>
                    <span className="checkout-order-item-price">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-divider" />

              <div className="cart-summary">
                <div className="cart-summary-row subtotal">
                  <span>Subtotaal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row tax">
                  <span>BTW (21%)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Verzending</span>
                  <span>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Totaal</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {isAuthenticated && (
                <div className="cart-loyalty-preview">
                  <Gift size={18} />
                  <span>
                    Je verdient <strong>{loyaltyPoints} punten</strong> met deze bestelling!
                  </span>
                </div>
              )}

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="checkout-payment-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Bezig met verwerken...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Betalen €{finalTotal.toFixed(2)}
                  </>
                )}
              </button>

              <div className="checkout-secure-notice">
                <Lock size={14} />
                <span>Veilige SSL-versleutelde betaling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
