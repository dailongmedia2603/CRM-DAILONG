/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch the Zalo Bot Token from the database
    const { data: settingsData, error: dbError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'zalo_bot_token')
      .single()

    if (dbError || !settingsData?.value) {
      return new Response(JSON.stringify({ error: 'Zalo Bot Token chưa được cấu hình trong cài đặt.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const botToken = settingsData.value;
    const zaloApiUrl = `https://bot-api.zapps.me/bot${botToken}/getMe`;

    // 2. Make the API call to Zalo
    const response = await fetch(zaloApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Add an empty JSON body for explicitness
    });

    const responseData = await response.json();

    // 3. Return the result to the client
    if (responseData.ok) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Kết nối thành công! Bot: ${responseData.result.account_name}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        error: `Kết nối thất bại: ${responseData.description || 'Lỗi không xác định.'}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})