'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function updateUserRole(userId, newRole, adminId) {
  // Check if admin is truly an ADMIN
  const { data: adminData } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single();

  if (adminData?.role !== 'ADMIN') {
    return { error: 'Não autorizado. Apenas ADMINs podem alterar perfis.' };
  }

  // Update target user's profile role
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) return { error: error.message };
  return { success: true };
}
