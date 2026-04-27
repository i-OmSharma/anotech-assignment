import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ data: null, error: 'Email and password required' }, { status: 400 });
    }
    await signIn('credentials', { email, password, redirect: false });
    return NextResponse.json({ data: { message: 'Logged in' }, error: null }, { status: 200 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ data: null, error: 'Invalid email or password' }, { status: 401 });
    }
    console.error('Login API error:', e);
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}
