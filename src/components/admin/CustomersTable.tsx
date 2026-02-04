'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Eye, Mail, Building, User, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  vat_number: string | null;
  role: string;
  loyalty_points: number;
  created_at: string;
}

interface CustomersTableProps {
  customers: Customer[];
  currentSearch?: string;
  currentType?: string;
}

export default function CustomersTable({ 
  customers, 
  currentSearch = '',
  currentType = '',
}: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/admin/customers?${params.toString()}`);
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    }
    return customer.email.split('@')[0];
  };

  return (
    <div className="admin-card">
      {/* Filters */}
      <div className="admin-table-filters">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Zoek op naam, email of bedrijf..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </form>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Klant</th>
              <th>Email</th>
              <th>Type</th>
              <th>Bedrijf</th>
              <th>Punten</th>
              <th>Lid sinds</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="admin-customer-cell">
                      <div className="admin-customer-avatar">
                        {customer.role === 'b2b' ? (
                          <Building size={18} />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div className="admin-customer-info">
                        <span className="admin-customer-name">
                          {getCustomerName(customer)}
                        </span>
                        {customer.phone && (
                          <span className="admin-customer-phone">{customer.phone}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${customer.role === 'b2b' ? 'b2b' : 'b2c'}`}>
                      {customer.role === 'b2b' ? 'B2B' : 'B2C'}
                    </span>
                  </td>
                  <td>{customer.company_name || '-'}</td>
                  <td>
                    <span className="admin-points">{customer.loyalty_points} pts</span>
                  </td>
                  <td className="text-muted">
                    {new Date(customer.created_at).toLocaleDateString('nl-NL')}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Link 
                        href={`/admin/customers/${customer.id}`}
                        className="admin-action-btn"
                        title="Bekijken"
                      >
                        <Eye size={16} />
                      </Link>
                      <a 
                        href={`mailto:${customer.email}`}
                        className="admin-action-btn"
                        title="Email sturen"
                      >
                        <Mail size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="admin-empty-table">
                  <User size={48} />
                  <p>Geen klanten gevonden</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
