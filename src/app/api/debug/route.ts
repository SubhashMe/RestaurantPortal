export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: existingAdmin } = await supabase.from('users').select('*').eq('email', 'admin@restoportal.com').maybeSingle();
  
  if (existingAdmin) {
    if (existingAdmin.role !== 'Admin') {
      await supabase.from('users').update({ role: 'Admin' }).eq('email', 'admin@restoportal.com');
      return NextResponse.json({ message: 'Updated existing user to Admin', user: existingAdmin });
    }
    return NextResponse.json({ message: 'Admin already exists', user: existingAdmin });
  }

  const { data: newUser, error } = await supabase.from('users').insert({
    email: 'admin@restoportal.com',
    password: 'adminpassword123',
    name: 'Portal Admin',
    role: 'Admin'
  }).select().maybeSingle();

  return NextResponse.json({ message: 'Admin created', user: newUser, error });
}
