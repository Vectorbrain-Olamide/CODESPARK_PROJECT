import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { report_id, community_name, state } = await req.json();

    // Find users whose community matches or is nearby and notify them
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, community, state")
      .eq("state", state);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const notifications = profiles.map((p) => ({
      user_id: p.id,
      type: "outage_nearby",
      title: `Outage reported near ${community_name}`,
      body: `A new power issue was reported in ${community_name}, ${state}.`,
      community: community_name,
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) throw error;

    return new Response(JSON.stringify({ notified: notifications.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
