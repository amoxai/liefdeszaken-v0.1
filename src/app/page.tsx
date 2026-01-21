import Image from "next/image";
import Link from 'next/link';
import { 
  Heart, 
  ArrowRight, 
  Truck, 
  Shield, 
  RefreshCw, 
  Gift,
  Sparkles,
  ShoppingBag,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return (data as Product[]) || [];
}

async function getCategories() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true })
    .limit(8);

  return data || [];
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <Sparkles size={16} />
              Nieuwe Collectie 2025
            </span>
            <h1 className="hero-title">
              Ontdek Producten met <span>Liefde</span> Gemaakt
            </h1>
            <p className="hero-description">
              Welkom bij Liefdeszaken! Ontdek onze zorgvuldig samengestelde collectie 
              van unieke producten. Perfect voor jezelf of als cadeau.
            </p>
            <div className="hero-buttons">
              <Link href="/products" className="hero-button-primary">
                <ShoppingBag size={20} />
                Shop Nu
              </Link>
              <Link href="/about" className="hero-button-secondary">
                Meer Over Ons
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Producten</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">10K+</div>
                <div className="hero-stat-label">Klanten</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">4.9</div>
                <div className="hero-stat-label">Rating</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)'
              }}>
                <Heart size={120} color="#ec4899" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: 'white' }}>
        <div className="section-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">
                <Truck size={28} />
              </div>
              <h3 className="feature-card-title">Gratis Verzending</h3>
              <p className="feature-card-description">
                Gratis verzending bij bestellingen boven �50
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <Shield size={28} />
              </div>
              <h3 className="feature-card-title">Veilig Betalen</h3>
              <p className="feature-card-description">
                iDEAL, Creditcard en meer betaalmethodes
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <RefreshCw size={28} />
              </div>
              <h3 className="feature-card-title">30 Dagen Retour</h3>
              <p className="feature-card-description">
                Niet tevreden? Geld terug garantie
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <Gift size={28} />
              </div>
              <h3 className="feature-card-title">Loyaliteit Punten</h3>
              <p className="feature-card-description">
                Spaar punten en krijg leuke beloningen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="section" style={{ background: '#f9fafb' }}>
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Shop per Categorie</h2>
              <p className="section-subtitle">
                Ontdek onze verschillende productcategorie�n
              </p>
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/products?category=${category.slug}`}
                  className="category-card"
                >
                  <div className="category-card-content">
                    <div className="category-card-icon">
                      <Heart size={28} />
                    </div>
                    <h3 className="category-card-title">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="section" style={{ background: 'white' }}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Uitgelichte Producten</h2>
            <p className="section-subtitle">
              Onze meest populaire en aanbevolen producten
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Er zijn nog geen uitgelichte producten.</p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link href="/products" className="section-link">
              Bekijk alle producten
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section" style={{ background: '#f9fafb' }}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Wat Klanten Zeggen</h2>
            <p className="section-subtitle">
              Lees de ervaringen van onze tevreden klanten
            </p>
          </div>
          <div className="features-grid">
            {[
              {
                name: 'Anna de Vries',
                text: 'Fantastische producten en snelle levering. Ik ben super tevreden!',
                rating: 5,
              },
              {
                name: 'Mark Jansen',
                text: 'De klantenservice is uitstekend. Mijn vragen werden snel beantwoord.',
                rating: 5,
              },
              {
                name: 'Lisa Bakker',
                text: 'Prachtige kwaliteit en mooi verpakt. Perfect als cadeau!',
                rating: 5,
              },
              {
                name: 'Peter van Dijk',
                text: 'Al meerdere keren besteld en altijd tevreden. Aanrader!',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="feature-card">
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', justifyContent: 'center' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="feature-card-description" style={{ fontStyle: 'italic' }}>
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <h3 className="feature-card-title" style={{ marginTop: '1rem' }}>
                  {testimonial.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Blijf op de hoogte!</h2>
          <p className="newsletter-description">
            Schrijf je in voor onze nieuwsbrief en ontvang exclusieve aanbiedingen 
            en 10% korting op je eerste bestelling.
          </p>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Jouw e-mailadres"
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Inschrijven
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
