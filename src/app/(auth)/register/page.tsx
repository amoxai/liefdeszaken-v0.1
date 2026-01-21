'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isB2B: false,
    companyName: '',
    vatNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.isB2B ? 'b2b' : 'consumer'
      );
      
      toast.success('Account aangemaakt! Controleer je e-mail om te bevestigen.');
      router.push('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">Maak een account</h1>
          <p className="register-subtitle">Registreer om te beginnen met winkelen</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Voornaam
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Jan"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Achternaam
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="de Vries"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="jouw@email.nl"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Wachtwoord
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Minimaal 8 tekens"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Bevestig wachtwoord
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Herhaal je wachtwoord"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isB2B"
                checked={formData.isB2B}
                onChange={handleChange}
                className="checkbox-input"
                disabled={isLoading}
              />
              <span>Ik wil een zakelijk account (B2B)</span>
            </label>
          </div>

          {formData.isB2B && (
            <>
              <div className="form-group">
                <label htmlFor="companyName" className="form-label">
                  Bedrijfsnaam
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Bedrijf B.V."
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="vatNumber" className="form-label">
                  BTW-nummer
                </label>
                <input
                  id="vatNumber"
                  name="vatNumber"
                  type="text"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="NL123456789B01"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Account aanmaken...
              </>
            ) : (
              'Registreren'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Heb je al een account?{' '}
            <Link href="/login" className="login-link">
              Log hier in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
