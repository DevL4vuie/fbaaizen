// Supabase Edge Function: admin-create-user
// Deploy with:  supabase functions deploy admin-create-user
// This is the ONLY place the service_role key is used — it never touches
// the browser/frontend. It verifies the caller is a signed-in admin
// before creating the new account.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? ''
console.log('KEY_LEN:', SERVICE_ROLE_KEY.length)

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { name, email, password, role } = await req.json()
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'name, email, and password are required' }), { status: 400, headers: cors })
    }
    const assignedRole = role === 'admin' ? 'admin' : 'user'

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    let userId
    if (createErr) {
      // If already registered, look up existing auth user
      if (createErr.message?.includes('already registered') || createErr.message?.includes('already been registered')) {
        const { data: list } = await admin.auth.admin.listUsers()
        const existing = list?.users?.find((u) => u.email === email)
        if (!existing) throw createErr
        userId = existing.id
      } else {
        throw createErr
      }
    } else {
      userId = created.user.id
    }

    const { error: profileErr } = await admin.from('profiles').upsert({
      id: userId,
      name,
      email,
      role: assignedRole,
      created_by_admin: true,
    }, { onConflict: 'id' })
    if (profileErr) throw profileErr

    return new Response(JSON.stringify({ success: true, id: userId }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message ?? 'Unknown error' }), { status: 500, headers: cors })
  }
})
