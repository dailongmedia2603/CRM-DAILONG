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

    const { data: settingsData, error: dbError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'zalo_bot_token')
      .single()

    if (dbError || !settingsData?.value) {
      return new Response(JSON.stringify({ error: 'Zalo OA Access Token chưa được cấu hình trong cài đặt.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const accessToken = settingsData.value;
    const zaloApiUrl = `https://openapi.zalo.me/v2.0/oa/getoa`;

    const response = await fetch(zaloApiUrl, {
      method: 'GET',
      headers: { 'access_token': accessToken },
    });
    
    const responseData = await response.json();

    if (responseData.error === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Kết nối thành công! Official Account: ${responseData.data.name}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        error: `Kết nối thất bại: ${responseData.message || 'Lỗi không xác định từ Zalo.'}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: `Lỗi máy chủ nội bộ: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})