'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        Mijn Profiel
      </h1>

      <div style={{ maxWidth: '600px' }}>
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit}>
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
              <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                E-mailadres kan niet worden gewijzigd.
              </small>
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

            <button
              type="submit"
              disabled={isLoading}
              className="dashboard-action-button"
              style={{ marginTop: '1rem' }}
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
    </div>
  );
}
