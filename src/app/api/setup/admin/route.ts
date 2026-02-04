import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST - Create admin user (one-time setup)
export async function POST(request: NextRequest) {
  // Security: Only allow this in development or with a secret key
  const authHeader = request.headers.get('x-setup-key');
  const setupKey = process.env.SETUP_SECRET_KEY || 'liefdeszaken-setup-2024';
  
  if (authHeader !== setupKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    
    const email = 'dev@amoxai.com';
    const password = 'admin123';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // Update the profile to admin if user exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          email: email,
          role: 'admin',
          first_name: 'Dev',
          last_name: 'Admin',
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      return NextResponse.json({ 
        message: 'User already exists, updated to admin role',
        userId: existingUser.id 
      });
    }

    // Create new user with admin privileges
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Dev',
        last_name: 'Admin',
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: 'Dev',
        last_name: 'Admin',
        role: 'admin',
        loyalty_points: 0,
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Don't fail - the user was created
    }

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      email: email,
      userId: authData.user.id,
      role: 'admin'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
