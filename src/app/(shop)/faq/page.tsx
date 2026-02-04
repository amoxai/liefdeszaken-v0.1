export default function FAQPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Veelgestelde Vragen</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Hoe lang duurt de levering?</h3>
          <p style={{ color: '#6b7280' }}>Bestellingen worden binnen 1-3 werkdagen geleverd.</p>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Kan ik retourneren?</h3>
          <p style={{ color: '#6b7280' }}>Ja, je hebt 14 dagen bedenktijd.</p>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Welke betaalmethodes?</h3>
          <p style={{ color: '#6b7280' }}>iDEAL, creditcard, PayPal en Bancontact.</p>
        </div>
      </div>
    </div>
  );
}
