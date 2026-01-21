import Link from 'next/link';
import { Heart, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Heart size={20} color="white" />
            </div>
            <span className="footer-logo-text">
              Liefdes<span>zaken</span>
            </span>
          </div>
          <p className="footer-description">
            Ontdek onze unieke collectie met liefde samengestelde producten. 
            Voor alle mooie momenten in het leven.
          </p>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="footer-social-link" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="footer-social-link" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Winkelen</h4>
          <ul className="footer-links">
            <li><Link href="/products">Alle Producten</Link></li>
            <li><Link href="/products?featured=true">Aanbiedingen</Link></li>
            <li><Link href="/products?new=true">Nieuw</Link></li>
            <li><Link href="/products?category=bestsellers">Bestsellers</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Klantenservice</h4>
          <ul className="footer-links">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">Veelgestelde vragen</Link></li>
            <li><Link href="/shipping">Verzending</Link></li>
            <li><Link href="/returns">Retourneren</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Over Ons</h4>
          <ul className="footer-links">
            <li><Link href="/about">Ons Verhaal</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Algemene Voorwaarden</Link></li>
            <li><Link href="/b2b">Zakelijk (B2B)</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} Liefdeszaken. Alle rechten voorbehouden.
        </p>
        <div className="footer-payment-methods">
          <span className="footer-payment-method">iDEAL</span>
          <span className="footer-payment-method">Visa</span>
          <span className="footer-payment-method">Mastercard</span>
          <span className="footer-payment-method">PayPal</span>
        </div>
      </div>
    </footer>
  );
}
