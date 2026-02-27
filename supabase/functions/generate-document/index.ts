import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doc_type, form_data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const formDetails = Object.entries(form_data)
      .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
      .join("\n");

    const systemPrompt = `You are an expert Indian legal document drafter. You generate professional, complete, ready-to-sign legal documents under Indian jurisdiction. 

STRICT RULES:
1. NEVER use any placeholders like [Name], [Date], {Company}, <blank>, "___", or any unfilled fields
2. ALL data must come from the provided form data - use the exact values given
3. Use professional legal language appropriate for Indian law
4. Format with markdown: # for title, ## for section headings, **bold** for emphasis
5. Include the current date: ${today}
6. DO NOT include any witness section
7. Include these sections as applicable: Title, Parties with full details, Recitals/Background, Definitions, Terms & Conditions, Payment/Consideration, Confidentiality, Termination, Dispute Resolution, Governing Law (India), Signature section
8. The document should be complete and ready for signing - no gaps, no instructions, no comments
9. Use formal legal formatting with numbered clauses
10. Signature section should have clear spaces for both parties with Name, Designation, Date fields`;

    const userPrompt = `Generate a complete ${doc_type} using the following details:

${formDetails}

Date of document: ${today}

Generate the full legal document now. Remember: NO placeholders, NO blanks, NO brackets. Use the exact data provided above.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content generated");

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
