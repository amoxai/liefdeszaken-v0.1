'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success('Check je email voor de reset link!');
      }
    } catch (error) {
      toast.error('Er is iets misgegaan. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-success">
              <div className="auth-success-icon">
                <Check size={32} />
              </div>
              <h1>Email Verzonden!</h1>
              <p>
                We hebben een email gestuurd naar <strong>{email}</strong> met 
                instructies om je wachtwoord te resetten.
              </p>
              <p className="auth-success-note">
                Controleer ook je spam folder als je de email niet kunt vinden.
              </p>
              <Link href="/login" className="auth-button">
                Terug naar Inloggen
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Wachtwoord Vergeten?</h1>
            <p>Geen probleem! Vul je email in en we sturen je een link om je wachtwoord te resetten.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="je@email.nl"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verzenden...' : 'Reset Link Versturen'}
            </button>
          </form>

          <div className="auth-footer">
            <Link href="/login" className="auth-back-link">
              <ArrowLeft size={16} />
              Terug naar Inloggen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
