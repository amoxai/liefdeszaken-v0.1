'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function B2BProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingVat, setIsValidatingVat] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    vatNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.company_name || '',
        vatNumber: user.vat_number || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateVatNumber = async () => {
    if (!formData.vatNumber) {
      toast.error('Vul eerst een BTW-nummer in');
      return;
    }

    setIsValidatingVat(true);

    try {
      // In a real app, you would call an API like VIES to validate the VAT number
      // For demo purposes, we'll simulate validation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simple validation: must start with country code and have at least 8 more chars
      const isValid = /^[A-Z]{2}[A-Z0-9]{8,}$/i.test(formData.vatNumber.replace(/\s/g, ''));

      if (isValid) {
        const supabase = createClient();
        await supabase
          .from('profiles')
          .update({ vat_validated: true })
          .eq('id', user?.id);

        await fetchUser();
        toast.success('BTW-nummer succesvol geverifieerd!');
      } else {
        toast.error('Ongeldig BTW-nummer formaat');
      }
    } catch {
      toast.error('Kon BTW-nummer niet valideren');
    } finally {
      setIsValidatingVat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          company_name: formData.companyName,
          vat_number: formData.vatNumber,
          vat_validated: formData.vatNumber !== user.vat_number ? false : user.vat_validated,
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchUser();
      toast.success('Profiel bijgewerkt!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Bedrijfsprofiel
      </h1>

      <div style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          {/* Company Information */}
          <div className="checkout-form-section">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Bedrijfsgegevens
            </h2>
            
            <div className="form-group">
              <label className="form-label">Bedrijfsnaam</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">BTW-nummer (VAT)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="NL123456789B01"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={validateVatNumber}
                  disabled={isValidatingVat}
                  className="dashboard-action-button secondary"
                >
                  {isValidatingVat ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    'Valideren'
                  )}
                </button>
              </div>
              {user?.vat_validated ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem',
                  color: '#22c55e',
                  fontSize: '0.875rem'
                }}>
                  <CheckCircle size={16} />
                  BTW-nummer is geverifieerd
                </div>
              ) : user?.vat_number ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem',
                  color: '#f59e0b',
                  fontSize: '0.875rem'
                }}>
                  <AlertCircle size={16} />
                  BTW-nummer nog niet geverifieerd
                </div>
              ) : null}
            </div>
          </div>

          {/* Contact Person */}
          <div className="checkout-form-section">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Contactpersoon
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Voornaam</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Achternaam</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-mailadres</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="form-input"
                  disabled
                  style={{ background: '#f3f4f6' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefoonnummer</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="dashboard-action-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Opslaan...
              </>
            ) : (
              <>
                <Save size={18} />
                Opslaan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
