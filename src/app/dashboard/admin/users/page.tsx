'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, Shield, Edit2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_name: string | null;
  created_at: string;
  loyalty_points: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Kon gebruikers niet laden');
    } else {
      setUsers(data || []);
    }
    
    setIsLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Kon rol niet bijwerken');
    } else {
      toast.success('Gebruikersrol bijgewerkt');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter((u) => u.role === roleFilter);

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    employee: users.filter((u) => u.role === 'employee').length,
    b2b: users.filter((u) => u.role === 'b2b').length,
    consumer: users.filter((u) => u.role === 'consumer').length,
  };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="dashboard-page-title">Gebruikers Beheer</h1>
      </div>

      {/* Role Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Alle' },
          { key: 'admin', label: 'Admin' },
          { key: 'employee', label: 'Werknemer' },
          { key: 'b2b', label: 'B2B' },
          { key: 'consumer', label: 'Consument' },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setRoleFilter(filter.key)}
            className={`dashboard-action-button ${roleFilter === filter.key ? '' : 'secondary'}`}
          >
            {filter.label} ({roleCounts[filter.key as keyof typeof roleCounts]})
          </button>
        ))}
      </div>

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Gebruiker</th>
                <th>E-mail</th>
                <th>Rol</th>
                <th>Bedrijf</th>
                <th>Punten</th>
                <th>Geregistreerd</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span style={{ fontWeight: 500 }}>
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'Geen naam'}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="form-input"
                      style={{ 
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.8rem',
                        width: 'auto'
                      }}
                    >
                      <option value="consumer">Consument</option>
                      <option value="b2b">B2B</option>
                      <option value="employee">Werknemer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{user.company_name || '-'}</td>
                  <td>{user.loyalty_points}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('nl-NL')}</td>
                  <td>
                    <Link
                      href={`/dashboard/admin/users/${user.id}`}
                      className="dashboard-icon-button"
                      title="Bewerken"
                    >
                      <Edit2 size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Geen gebruikers gevonden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
