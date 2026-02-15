import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create user profile in users table
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ user: data.user, session: data.session });
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ user: data.user, session: data.session });
    }

    if (action === 'signout') {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}
