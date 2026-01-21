import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function B2BDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login?redirect=/dashboard/b2b');
  }

  // Check if user has B2B role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'b2b' && profile?.role !== 'admin') {
    redirect('/dashboard/consumer');
  }

  return (
    <DashboardLayout role="b2b">
      {children}
    </DashboardLayout>
  );
}
