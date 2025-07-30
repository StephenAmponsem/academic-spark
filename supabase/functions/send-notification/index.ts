import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, message, type, sendEmail = false } = await req.json();

    if (!userId || !title || !message || !type) {
      throw new Error('Missing required fields');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create in-app notification
    const { data: notification, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type
      })
      .select()
      .single();

    if (notificationError) {
      throw new Error('Failed to create notification');
    }

    // Send email if requested
    if (sendEmail) {
      // Get user email
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
      if (userError || !user?.email) {
        console.warn('Could not get user email for notification');
      } else {
        try {
          await resend.emails.send({
            from: 'EduLearn <notifications@resend.dev>',
            to: [user.email],
            subject: title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${title}</h2>
                <p style="color: #666; line-height: 1.6;">${message}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                  This notification was sent from your EduLearn account.
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the entire request if email fails
        }
      }
    }

    return new Response(JSON.stringify(notification), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});