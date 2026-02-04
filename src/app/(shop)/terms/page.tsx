export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Algemene Voorwaarden</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#374151' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Artikel 1 - Definities</h2>
          <p>In deze voorwaarden wordt verstaan onder Liefdeszaken: de webshop liefdeszaken.vercel.app.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Artikel 2 - Toepasselijkheid</h2>
          <p>Deze voorwaarden zijn van toepassing op alle aanbiedingen en overeenkomsten.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Artikel 3 - Prijzen</h2>
          <p>Alle prijzen zijn inclusief BTW en exclusief verzendkosten, tenzij anders vermeld.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Artikel 4 - Levering</h2>
          <p>Levering vindt plaats zolang de voorraad strekt. Levertijd is 1-3 werkdagen.</p>
        </section>
      </div>
    </div>
  );
}
