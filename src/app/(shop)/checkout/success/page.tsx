import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.order;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '5rem',
            height: '5rem',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            color: 'white'
          }}>
            <CheckCircle size={48} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>
            Bedankt voor je bestelling!
          </h1>

          <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
            Je bestelling is succesvol geplaatst. Je ontvangt een bevestigingsmail met de details.
          </p>

          {orderNumber && (
            <div style={{
              background: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              marginBottom: '2rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Bestelnummer
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>
                {orderNumber}
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
            background: '#fef3c7',
            borderRadius: '0.75rem',
            marginBottom: '2rem'
          }}>
            <Package size={24} style={{ color: '#92400e' }} />
            <p style={{ color: '#92400e', fontSize: '0.9rem' }}>
              Je bestelling wordt zo snel mogelijk verzonden!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/products" 
              className="hero-button-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Verder winkelen
            </Link>
            <Link 
              href="/dashboard/consumer" 
              className="hero-button-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Bekijk je bestellingen
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
