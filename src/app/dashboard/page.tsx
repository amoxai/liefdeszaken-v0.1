'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Controleren...');

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function redirectToRoleDashboard() {
      try {
        const supabase = createClient();
        
        // Set timeout - if it takes too long, redirect to consumer dashboard
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('Timeout - redirecting to consumer dashboard');
            router.replace('/dashboard/consumer');
          }
        }, 5000);

        setStatus('Gebruiker ophalen...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.log('Auth error:', authError.message);
          if (mounted) router.replace('/login');
          return;
        }

        if (!user) {
          console.log('No user - redirecting to login');
          if (mounted) router.replace('/login');
          return;
        }

        console.log('User found:', user.email);
        setStatus('Profiel ophalen...');

        // Try to get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.log('Profile error:', profileError.message);
          // No profile - go to consumer dashboard anyway
          if (mounted) router.replace('/dashboard/consumer');
          return;
        }

        const role = profile?.role || 'consumer';
        console.log('Role:', role);
        setStatus(`Doorsturen naar ${role} dashboard...`);

        clearTimeout(timeoutId);

        if (mounted) {
          switch (role) {
            case 'admin':
              router.replace('/admin');
              break;
            case 'employee':
              router.replace('/dashboard/employee');
              break;
            case 'b2b':
              router.replace('/dashboard/b2b');
              break;
            default:
              router.replace('/dashboard/consumer');
          }
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        if (mounted) router.replace('/dashboard/consumer');
      }
    }

    redirectToRoleDashboard();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <div className="dashboard-loading">
      <div className="loading-content">
        <div className="loading-spinner" />
        <p>{status}</p>
      </div>
      <style jsx>{`
        .dashboard-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%);
        }
        .loading-content {
          text-align: center;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #ec4899;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        .loading-content p {
          color: #6b7280;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
