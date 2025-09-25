/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { bot_token, chat_id } = await req.json()

    if (!bot_token || !chat_id) {
      return new Response(JSON.stringify({ error: 'Bot token and chat ID are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Test bot token with getMe
    const getMeUrl = `https://api.telegram.org/bot${bot_token}/getMe`;
    const getMeResponse = await fetch(getMeUrl);
    const getMeData = await getMeResponse.json();

    if (!getMeData.ok) {
      return new Response(JSON.stringify({ error: `Token không hợp lệ: ${getMeData.description}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const botName = getMeData.result.first_name;

    // 2. Send a test message
    const sendMessageUrl = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    const testMessage = `✅ Kết nối thành công!\nBot: ${botName}\nChat ID: ${chat_id}\nĐây là tin nhắn thử nghiệm từ hệ thống CRM.`;
    
    const sendMessageResponse = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat_id,
        text: testMessage,
      }),
    });

    const sendMessageData = await sendMessageResponse.json();

    if (!sendMessageData.ok) {
      return new Response(JSON.stringify({ error: `Không thể gửi tin nhắn đến Chat ID: ${sendMessageData.description}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: `Kiểm tra thành công! Một tin nhắn đã được gửi từ bot '${botName}'.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})