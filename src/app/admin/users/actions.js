'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function isAdmin(adminId) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single();
  return data?.role === 'ADMIN';
}

export async function updateUserRole(userId, newRole, adminId) {
  if (!(await isAdmin(adminId))) {
    return { error: 'Não autorizado. Apenas ADMINs podem alterar perfis.' };
  }
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function inviteUser(email, role, fullName, adminId) {
  if (!(await isAdmin(adminId))) {
    return { error: 'Não autorizado.' };
  }

  // Convida via Supabase Auth (envia e-mail de convite)
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://adonias.vercel.app'}/auth/reset-password`,
  });

  if (error) return { error: error.message };

  // Insere o perfil com a role desejada (o trigger pode estar com full_name vazio)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: data.user.id, full_name: fullName || email, role: role })
    .eq('id', data.user.id);

  if (profileError) return { error: profileError.message };
  return { success: true };
}

export async function deleteUser(userId, adminId) {
  if (!(await isAdmin(adminId))) {
    return { error: 'Não autorizado.' };
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function listUsersWithStatus(adminId) {
  if (!(await isAdmin(adminId))) {
    return { error: 'Não autorizado.' };
  }

  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) return { error: authError.message };

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role');

  const profileMap = {};
  profiles?.forEach(p => { profileMap[p.id] = p; });

  const users = authUsers.users.map(u => ({
    id: u.id,
    email: u.email,
    full_name: profileMap[u.id]?.full_name || u.user_metadata?.full_name || '—',
    role: profileMap[u.id]?.role || 'OPERACIONAL',
    confirmed: !!u.email_confirmed_at,
    last_sign_in: u.last_sign_in_at,
    created_at: u.created_at,
    invited: !u.email_confirmed_at && !!u.invited_at,
  }));

  return { users };
}
