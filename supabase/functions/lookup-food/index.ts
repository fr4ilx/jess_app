import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  sodium: number;
  fiber: number;
  addedSugars: number;
  source: "usda" | "ai";
}

// USDA nutrient IDs
const NUTRIENT_IDS: Record<string, number> = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  saturatedFat: 1258,
  sodium: 1093,
  fiber: 1079,
  addedSugars: 1235,
};

async function lookupUSDA(foodName: string, portionGrams: number): Promise<NutritionResult | null> {
  const USDA_API_KEY = Deno.env.get("USDA_API_KEY");
  if (!USDA_API_KEY) {
    console.log("USDA_API_KEY not configured, skipping USDA lookup");
    return null;
  }

  try {
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(foodName)}&pageSize=1&dataType=Foundation,SR Legacy`;
    const searchResp = await fetch(searchUrl);

    if (!searchResp.ok) {
      console.error("USDA search failed:", searchResp.status);
      return null;
    }

    const searchData = await searchResp.json();
    const food = searchData.foods?.[0];
    if (!food) return null;

    const nutrients = food.foodNutrients || [];
    const getNutrient = (id: number): number => {
      const n = nutrients.find((n: any) => n.nutrientId === id);
      return n?.value ?? 0;
    };

    // USDA values are per 100g, scale to portion
    const scale = portionGrams / 100;

    return {
      calories: Math.round(getNutrient(NUTRIENT_IDS.calories) * scale),
      protein: Math.round(getNutrient(NUTRIENT_IDS.protein) * scale),
      carbs: Math.round(getNutrient(NUTRIENT_IDS.carbs) * scale),
      fat: Math.round(getNutrient(NUTRIENT_IDS.fat) * scale),
      saturatedFat: Math.round(getNutrient(NUTRIENT_IDS.saturatedFat) * scale),
      sodium: Math.round(getNutrient(NUTRIENT_IDS.sodium) * scale),
      fiber: Math.round(getNutrient(NUTRIENT_IDS.fiber) * scale),
      addedSugars: Math.round(getNutrient(NUTRIENT_IDS.addedSugars) * scale),
      source: "usda",
    };
  } catch (err) {
    console.error("USDA lookup error:", err);
    return null;
  }
}

async function lookupAI(foodName: string, portionGrams: number): Promise<NutritionResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are a nutrition database. Given a food item and portion size, return estimated nutritional information. Always respond using the provided tool.",
        },
        {
          role: "user",
          content: `Estimate the nutrition for: "${foodName}", portion size: ${portionGrams}g`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_nutrition",
            description: "Return estimated nutrition data for a food item",
            parameters: {
              type: "object",
              properties: {
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
                saturatedFat: { type: "number" },
                sodium: { type: "number" },
                fiber: { type: "number" },
                addedSugars: { type: "number" },
              },
              required: ["calories", "protein", "carbs", "fat", "saturatedFat", "sodium", "fiber", "addedSugars"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_nutrition" } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI gateway error [${response.status}]: ${text}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) throw new Error("No nutrition data returned from AI");

  const nutrition = JSON.parse(toolCall.function.arguments);
  return { ...nutrition, source: "ai" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName, portionGrams } = await req.json();

    if (!foodName || typeof foodName !== "string" || foodName.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Food name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (foodName.length > 200) {
      return new Response(JSON.stringify({ error: "Food name too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const portion = typeof portionGrams === "number" && portionGrams > 0 ? portionGrams : 100;
    const name = foodName.trim();

    // Try USDA first, fall back to AI
    let result = await lookupUSDA(name, portion);

    if (!result) {
      console.log(`USDA miss for "${name}", falling back to AI`);
      result = await lookupAI(name, portion);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lookup-food error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("429")) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.includes("402")) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
