import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  // Diagnóstico de presença
  if (!supabaseUrl) return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL ausente.' }, { status: 500 });
  if (!supabaseServiceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ausente no Vercel.' }, { status: 500 });

  // Diagnóstico de Formato (Service Key deve ser um JWT começando com eyJ)
  if (!supabaseServiceKey.startsWith('eyJ')) {
    return NextResponse.json({ 
      error: 'A chave SUPABASE_SERVICE_ROLE_KEY parece inválida (não começa com eyJ). Verifique se você não colou a Anon Key por engano.' 
    }, { status: 500 });
  }

  // Verificação de segurança: Comparar com a Anon Key
  if (supabaseServiceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    return NextResponse.json({ 
      error: 'A chave de serviço é IDÊNTICA à anon key. Você deve usar a SERVICE_ROLE_KEY (Chave Secreta) para esta função. Verifique as variáveis no Vercel.' 
    }, { status: 500 });
  }

  try {
    const { email, role, full_name } = await req.json();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Convidar usuário
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role }
    });

    if (inviteError) {
      console.error('Erro Supabase Invite:', inviteError);
      return NextResponse.json({ 
        error: `Erro do Supabase API: ${inviteError.message} (Status: ${inviteError.status})` 
      }, { status: inviteError.status || 500 });
    }

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
