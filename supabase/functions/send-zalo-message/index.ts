/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("Function send-zalo-message invoked with method:", req.method);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request.");
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Attempting to parse request body.");
    const { chatId, messageText } = await req.json();
    console.log("Request body parsed:", { chatId, messageText });

    if (!chatId || !messageText) {
      console.warn("Missing chatId or messageText.");
      return new Response(JSON.stringify({ error: 'Yêu cầu Chat ID và nội dung tin nhắn.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log("Initializing Supabase admin client.");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Fetching Zalo Bot Token from settings.");
    const { data: settingsData, error: dbError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'zalo_bot_token')
      .single();

    if (dbError || !settingsData?.value) {
      console.error("DB Error or Token not found:", dbError);
      return new Response(JSON.stringify({ error: 'Zalo Bot Token chưa được cấu hình.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const botToken = settingsData.value;
    console.log("Token found. Preparing to call Zalo API.");
    const zaloApiUrl = `https://bot-api.zapps.me/bot${botToken}/sendMessage`;

    const response = await fetch(zaloApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: messageText }),
    });

    const responseData = await response.json();
    console.log("Zalo API response:", responseData);

    if (responseData.ok) {
      console.log("Message sent successfully.");
      return new Response(JSON.stringify({ success: true, message: 'Đã gửi tin nhắn thành công!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      console.warn("Failed to send message:", responseData);
      return new Response(JSON.stringify({ error: `Lỗi khi gửi tin nhắn: ${responseData.description || 'Lỗi không xác định từ Zalo.'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error) {
    console.error("Caught an unexpected error in send-zalo-message:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})