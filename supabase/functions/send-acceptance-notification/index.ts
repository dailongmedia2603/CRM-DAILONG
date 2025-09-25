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
    const { projectName, clientName, acceptanceLink } = await req.json()

    if (!projectName || !clientName || !acceptanceLink) {
      return new Response(JSON.stringify({ error: 'Project details are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get the ID of the bot to use for acceptance notifications
    const { data: settingData, error: settingError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'telegram_acceptance_bot_id')
      .single()

    if (settingError || !settingData?.value) {
      console.error('Acceptance notification bot not configured:', settingError)
      return new Response(JSON.stringify({ message: 'Project updated, but acceptance notification bot not configured.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const botId = settingData.value;

    // 2. Get the bot's token and chat ID
    const { data: botData, error: botError } = await supabaseAdmin
      .from('telegram_bots')
      .select('bot_token, chat_id')
      .eq('id', botId)
      .single()

    if (botError || !botData) {
      console.error('Error fetching bot details for ID:', botId, botError)
      return new Response(JSON.stringify({ message: 'Project updated, but could not find bot details.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { bot_token, chat_id } = botData;

    // 3. Construct and send the message
    const message = `🔔 *Dự án cần nghiệm thu* 🔔\n\n` +
                    `*Dự án:* ${projectName}\n` +
                    `*Khách hàng:* ${clientName}\n\n` +
                    `🔗 [Link nghiệm thu](${acceptanceLink})`;

    const sendMessageUrl = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    
    const response = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat_id,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const responseData = await response.json();

    if (!responseData.ok) {
      console.error('Failed to send Telegram message:', responseData.description);
    }

    return new Response(JSON.stringify({ message: 'Notification processed.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-acceptance-notification function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})