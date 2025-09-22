/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("Function invoked with method:", req.method);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request.");
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Initializing Supabase admin client.");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Fetching Zalo Bot Token from settings.");
    const { data: settingsData, error: dbError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'zalo_bot_token')
      .single()

    if (dbError) {
      console.error("Database error fetching token:", dbError);
      return new Response(JSON.stringify({ error: `Lỗi cơ sở dữ liệu: ${dbError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!settingsData?.value) {
      console.warn("Zalo Bot Token not found in settings.");
      return new Response(JSON.stringify({ error: 'Zalo Bot Token chưa được cấu hình trong cài đặt.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const botToken = settingsData.value;
    console.log("Token found. Preparing to call Zalo API.");
    const zaloApiUrl = `https://bot-api.zapps.me/bot${botToken}/getMe`;

    const response = await fetch(zaloApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    console.log("Zalo API response status:", response.status);
    const responseData = await response.json();
    console.log("Zalo API response data:", responseData);

    if (responseData.ok) {
      console.log("Zalo connection successful.");
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Kết nối thành công! Bot: ${responseData.result.account_name}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      console.warn("Zalo connection failed:", responseData);
      return new Response(JSON.stringify({ 
        error: `Kết nối thất bại: ${responseData.description || 'Lỗi không xác định từ Zalo.'}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error) {
    console.error("Caught an unexpected error:", error);
    return new Response(JSON.stringify({ error: `Lỗi máy chủ nội bộ: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})