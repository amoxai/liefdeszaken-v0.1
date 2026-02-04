import Link from 'next/link';

export default function B2BPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Zakelijk (B2B)</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Speciaal voor zakelijke klanten bieden wij aantrekkelijke kortingen en flexibele bestelvoorwaarden.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#374151' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Voordelen voor zakelijke klanten</h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Staffelkortingen tot 25%</li>
            <li>Betalen op factuur (na goedkeuring)</li>
            <li>Dedicated accountmanager</li>
            <li>Snelle levering voor grote bestellingen</li>
            <li>Gepersonaliseerde cadeauverpakkingen</li>
          </ul>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Voor wie?</h2>
          <p>Hotels, restaurants, bedrijven, evenementenorganisaties, en iedereen die regelmatig grotere hoeveelheden nodig heeft.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Aanmelden</h2>
          <p style={{ marginBottom: '1rem' }}>
            Registreer je als zakelijke klant en geef je BTW-nummer op. Na verificatie krijg je toegang tot zakelijke prijzen.
          </p>
          <Link 
            href="/register" 
            style={{ 
              display: 'inline-block',
              background: '#ec4899', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            Registreer als zakelijke klant
          </Link>
        </section>
      </div>
    </div>
  );
}
