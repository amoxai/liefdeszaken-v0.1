'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success('Je wachtwoord is succesvol gewijzigd!');
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
              <h1>Wachtwoord Gewijzigd!</h1>
              <p>
                Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je 
                nieuwe wachtwoord.
              </p>
              <Link href="/login" className="auth-button">
                Naar Inloggen
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
            <h1>Nieuw Wachtwoord</h1>
            <p>Kies een nieuw wachtwoord voor je account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="password">Nieuw Wachtwoord</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 6 tekens"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Bevestig Wachtwoord</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal je wachtwoord"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Opslaan...' : 'Wachtwoord Opslaan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
