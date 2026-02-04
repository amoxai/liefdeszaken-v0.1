export default function ReturnsPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Retourneren</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#374151' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>14 dagen bedenktijd</h2>
          <p>Je hebt 14 dagen bedenktijd na ontvangst van je bestelling. Binnen deze periode kun je het product retourneren.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Voorwaarden</h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Product moet ongebruikt en in originele verpakking zijn</li>
            <li>Bloemen en bederfelijke producten kunnen niet geretourneerd worden</li>
            <li>Gepersonaliseerde producten zijn uitgesloten van retour</li>
          </ul>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hoe retourneren?</h2>
          <p>Neem contact met ons op via info@liefdeszaken.nl met je ordernummer. Wij sturen je een retourlabel.</p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Terugbetaling</h2>
          <p>Na ontvangst van het geretourneerde product wordt het bedrag binnen 5 werkdagen teruggestort.</p>
        </section>
      </div>
    </div>
  );
}
