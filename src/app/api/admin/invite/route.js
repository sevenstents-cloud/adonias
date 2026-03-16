import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ 
      error: 'Configuração do servidor incompleta: SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente do Vercel.' 
    }, { status: 500 });
  }

  try {
    const { email, role, full_name } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email e Role são obrigatórios.' }, { status:400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Convidar usuário via Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role } // Metadados iniciais
    });

    if (inviteError) throw inviteError;

    // 2. Garantir que o perfil seja criado (o trigger pode fazer isso, mas vamos reforçar ou atualizar)
    // O id vem de inviteData.user.id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: inviteData.user.id,
        full_name: full_name || email.split('@')[0],
        role: role,
        email: email,
        invited_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Erro ao criar perfil após convite:', profileError);
      // Não vamos dar throw aqui porque o convite já foi enviado
    }

    return NextResponse.json({ success: true, user: inviteData.user });
  } catch (error) {
    console.error('Erro no convite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
