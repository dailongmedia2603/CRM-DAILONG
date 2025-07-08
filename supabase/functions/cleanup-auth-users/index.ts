/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all users from the auth schema
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const emailsToKeep = ['huulong@dailongmedia.com', 'quangdai@dailongmedia.com'];
    
    // Filter out the users to be deleted
    const usersToDelete = users.filter(user => !emailsToKeep.includes(user.email!));

    if (usersToDelete.length === 0) {
      return new Response(JSON.stringify({ message: 'Không có tài khoản nào cần xóa.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Create an array of delete promises
    const deletePromises = usersToDelete.map(user => 
      supabaseAdmin.auth.admin.deleteUser(user.id)
    );

    // Execute all delete promises
    await Promise.all(deletePromises);

    return new Response(JSON.stringify({ message: `Đã xóa thành công ${usersToDelete.length} tài khoản.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Lỗi khi dọn dẹp tài khoản:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})