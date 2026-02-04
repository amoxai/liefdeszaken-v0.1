'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact</h1>
          <p>Heb je een vraag of wil je meer weten? We helpen je graag!</p>
        </div>
      </div>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Neem Contact Op</h2>
              <p>
                We staan klaar om al je vragen te beantwoorden. Neem gerust contact 
                met ons op via een van de onderstaande manieren.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-method-icon">
                    <Mail size={24} />
                  </div>
                  <div className="contact-method-info">
                    <h3>Email</h3>
                    <a href="mailto:info@liefdeszaken.nl">info@liefdeszaken.nl</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">
                    <Phone size={24} />
                  </div>
                  <div className="contact-method-info">
                    <h3>Telefoon</h3>
                    <a href="tel:+31201234567">+31 20 123 4567</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">
                    <Clock size={24} />
                  </div>
                  <div className="contact-method-info">
                    <h3>Bereikbaarheid</h3>
                    <p>Ma - Vr: 9:00 - 17:00</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="contact-method-info">
                    <h3>Adres</h3>
                    <p>Liefdesstraat 1<br />1234 AB Amsterdam</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <h2>Stuur een Bericht</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Naam *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Je naam"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="je@email.nl"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Onderwerp *</label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    placeholder="Waar gaat je vraag over?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Bericht *</label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={5}
                    placeholder="Je bericht..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="contact-submit"
                  disabled={isSubmitting}
                >
                  <Send size={18} />
                  {isSubmitting ? 'Verzenden...' : 'Verstuur Bericht'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
