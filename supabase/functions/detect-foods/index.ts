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
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const imageUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a food detection expert. Analyze the meal photo and identify all visible food items. For each food, estimate a reasonable portion size in grams and provide nutrition estimates per that portion. Be specific about the food (e.g. "grilled salmon fillet" not just "fish"). Always respond by calling the provided tool.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What foods do you see in this meal photo? Identify each food item with portion and nutrition estimates.",
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_detected_foods",
              description: "Return the list of detected foods with nutrition estimates",
              parameters: {
                type: "object",
                properties: {
                  foods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name of the food item" },
                        portion: { type: "number", description: "Estimated portion size in grams" },
                        calories: { type: "number", description: "Estimated calories (kcal)" },
                        protein: { type: "number", description: "Protein in grams" },
                        carbs: { type: "number", description: "Carbohydrates in grams" },
                        fat: { type: "number", description: "Total fat in grams" },
                        saturatedFat: { type: "number", description: "Saturated fat in grams" },
                        sodium: { type: "number", description: "Sodium in milligrams" },
                        fiber: { type: "number", description: "Dietary fiber in grams" },
                        addedSugars: { type: "number", description: "Added sugars in grams" },
                      },
                      required: ["name", "portion", "calories", "protein", "carbs", "fat", "saturatedFat", "sodium", "fiber", "addedSugars"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["foods"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_detected_foods" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "OpenAI rate limit. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "OpenAI auth failed — check OPENAI_API_KEY secret." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Surface the OpenAI message to the caller so the toast is actionable.
      return new Response(JSON.stringify({ error: `OpenAI [${response.status}]: ${text.slice(0, 300)}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];

    let result: { foods: unknown } | null = null;

    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool args:", toolCall.function.arguments, e);
      }
    }

    // Fallback: if the model returned plain text instead of a tool call, try to
    // pull a JSON object out of message.content. Helps when OpenAI ignores the
    // tool_choice for a non-food / blank image and just refuses in prose.
    if (!result && typeof message?.content === "string") {
      const match = message.content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          /* swallow */
        }
      }
    }

    if (!result || !Array.isArray((result as { foods?: unknown }).foods)) {
      console.error("No tool_call returned. Full response:", JSON.stringify(data).slice(0, 800));
      const refusal = typeof message?.content === "string" ? message.content.slice(0, 200) : "";
      return new Response(
        JSON.stringify({
          error: refusal
            ? `AI didn't detect any food: ${refusal}`
            : "AI didn't return food data — try a clearer photo.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("detect-foods error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
