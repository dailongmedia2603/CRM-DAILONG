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
      return new Response(JSON.stringify({ error: 'Yêu cầu User ID và nội dung tin nhắn.' }), {
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
      return new Response(JSON.stringify({ error: 'Zalo OA Access Token chưa được cấu hình.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const accessToken = settingsData.value;
    const zaloApiUrl = `https://openapi.zalo.me/v3.0/oa/message`;

    const payload = {
      recipient: {
        user_id: chatId,
      },
      message: {
        text: messageText,
      },
    };

    const response = await fetch(zaloApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'access_token': accessToken
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (responseData.error === 0) {
      return new Response(JSON.stringify({ success: true, message: 'Đã gửi tin nhắn thành công!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: `Lỗi khi gửi tin nhắn: ${responseData.message || 'Lỗi không xác định từ Zalo.'}` }), {
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