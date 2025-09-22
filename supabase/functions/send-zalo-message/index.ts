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
    const { chatId, messageText } = await req.json();

    if (!chatId || !messageText) {
      return new Response(JSON.stringify({ error: 'Yêu cầu Chat ID và nội dung tin nhắn.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settingsData, error: dbError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'zalo_bot_token')
      .single();

    if (dbError || !settingsData?.value) {
      return new Response(JSON.stringify({ error: 'Zalo Bot Token chưa được cấu hình.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const botToken = settingsData.value;
    const zaloApiUrl = `https://bot-api.zapps.me/bot${botToken}/sendMessage`;

    const response = await fetch(zaloApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: messageText }),
    });

    const responseData = await response.json();

    if (responseData.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Đã gửi tin nhắn thành công!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: `Lỗi khi gửi tin nhắn: ${responseData.description || 'Lỗi không xác định từ Zalo.'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})