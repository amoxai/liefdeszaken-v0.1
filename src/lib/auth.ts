import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/types';

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = 'consumer'
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Fetch profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as UserProfile | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

// Role check utilities
export function hasRole(user: UserProfile | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isAdmin(user: UserProfile | null): boolean {
  return hasRole(user, ['admin']);
}

export function isEmployee(user: UserProfile | null): boolean {
  return hasRole(user, ['admin', 'employee']);
}

export function isB2B(user: UserProfile | null): boolean {
  return hasRole(user, ['b2b']);
}

export function isConsumer(user: UserProfile | null): boolean {
  return hasRole(user, ['consumer']);
}

export function canAccessDashboard(user: UserProfile | null, dashboard: string): boolean {
  if (!user) return false;

  switch (dashboard) {
    case 'admin':
      return user.role === 'admin';
    case 'employee':
      return ['admin', 'employee'].includes(user.role);
    case 'b2b':
      return user.role === 'b2b';
    case 'consumer':
      return ['admin', 'employee', 'b2b', 'consumer'].includes(user.role);
    default:
      return false;
  }
}
