export default function ShippingPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Verzending</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#374151' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Verzendkosten</h2>
          <p>Nederland: 4,95 euro (gratis vanaf 50 euro)</p>
          <p>Belgie: 6,95 euro (gratis vanaf 75 euro)</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Levertijd</h2>
          <p>Nederland: 1-2 werkdagen</p>
          <p>Belgie: 2-3 werkdagen</p>
        </section>
      </div>
    </div>
  );
}
