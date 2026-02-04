import { Metadata } from 'next';
import { Heart, Users, Award, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Over Ons',
  description: 'Leer meer over Liefdeszaken en onze passie voor romantische cadeaus.',
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>Over Liefdeszaken</h1>
          <p>Met liefde samengesteld, voor alle mooie momenten in het leven.</p>
        </div>
      </div>

      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2>Ons Verhaal</h2>
            <p>
              Liefdeszaken is ontstaan vanuit een simpele gedachte: iedereen verdient 
              het om de mensen waar ze van houden te verrassen met iets bijzonders. 
              Wij geloven dat een cadeau meer is dan alleen een product - het is een 
              manier om liefde, waardering en verbondenheid uit te drukken.
            </p>
            <p>
              Onze collectie is met zorg samengesteld en bevat unieke producten die 
              perfect zijn voor elke romantische gelegenheid, of het nu gaat om 
              Valentijnsdag, een jubileum, of gewoon een spontane verrassing.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <h2>Onze Waarden</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <Heart size={32} />
              </div>
              <h3>Met Liefde</h3>
              <p>Elk product wordt met zorg geselecteerd om de perfecte emotie over te brengen.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Award size={32} />
              </div>
              <h3>Kwaliteit</h3>
              <p>Wij werken alleen met de beste leveranciers voor hoogwaardige producten.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Truck size={32} />
              </div>
              <h3>Snelle Levering</h3>
              <p>Bestel voor 16:00 uur en ontvang je pakket de volgende werkdag.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Users size={32} />
              </div>
              <h3>Persoonlijke Service</h3>
              <p>Ons team staat altijd klaar om je te helpen met advies en vragen.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
