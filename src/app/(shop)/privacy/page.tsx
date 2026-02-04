export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Privacy Policy</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#374151' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Welke gegevens verzamelen wij?</h2>
          <p>Wij verzamelen alleen de gegevens die nodig zijn voor het verwerken van je bestelling: naam, adres, email en telefoonnummer.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hoe gebruiken wij je gegevens?</h2>
          <p>Je gegevens worden uitsluitend gebruikt voor het verwerken en verzenden van je bestelling, en voor klantenservice.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delen met derden</h2>
          <p>Wij delen je gegevens alleen met bezorgdiensten en betalingsverwerkers die nodig zijn voor je bestelling.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Je rechten</h2>
          <p>Je hebt recht op inzage, correctie en verwijdering van je gegevens. Neem contact met ons op via info@liefdeszaken.nl.</p>
        </section>
      </div>
    </div>
  );
}
