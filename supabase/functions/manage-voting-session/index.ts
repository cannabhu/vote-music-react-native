// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check if there's an active voting session
    const { data: activeSession } = await supabaseClient
      .from("voting_sessions")
      .select()
      .eq("is_active", true)
      .single();

    const now = new Date();

    if (!activeSession) {
      // Create new voting session
      const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      await supabaseClient.from("voting_sessions").insert({
        end_time: endTime.toISOString(),
        is_active: true,
      });
    } else {
      // Check if current session has ended
      const sessionEndTime = new Date(activeSession.end_time);
      if (now >= sessionEndTime) {
        // Get song with highest votes
        const { data: topSong } = await supabaseClient
          .from("songs")
          .select()
          .order("vote_count", { ascending: false })
          .limit(1)
          .single();

        if (topSong) {
          // Update session with top song
          await supabaseClient
            .from("voting_sessions")
            .update({
              is_active: false,
              top_song_id: topSong.id,
            })
            .eq("id", activeSession.id);

          // Reset all vote counts
          await supabaseClient
            .from("songs")
            .update({ vote_count: 0 })
            .neq("id", "");

          // Start new session
          const newEndTime = new Date(now.getTime() + 5 * 60 * 1000);
          await supabaseClient.from("voting_sessions").insert({
            end_time: newEndTime.toISOString(),
            is_active: true,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/manage-voting-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
