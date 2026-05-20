import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Plus, Minus, Check, ArrowLeft, Loader2, Search, Barcode, Keyboard, Zap, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MacroBar } from "@/components/MacroBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAddMeal } from "@/hooks/useMealsToday";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface DetectedFood {
  id: string;
  name: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  sodium: number;
  fiber: number;
  addedSugars: number;
  isLookingUp?: boolean;
  source?: "usda" | "ai" | "vision";
}

const emptyFood: Omit<DetectedFood, "id"> = {
  name: "",
  portion: 100,
  unit: "g",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  saturatedFat: 0,
  sodium: 0,
  fiber: 0,
  addedSugars: 0,
};

const mealTypes: { value: MealType; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍎" },
];

export default function AddMeal() {
  const navigate = useNavigate();
  const addMeal = useAddMeal();
  const [step, setStep] = useState<"upload" | "detecting" | "review" | "confirm">("upload");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [foods, setFoods] = useState<DetectedFood[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setStep("detecting");

      try {
        const { data, error } = await supabase.functions.invoke("detect-foods", {
          body: { imageBase64: base64 },
        });

        if (error) {
          // FunctionsHttpError exposes the raw Response on .context — read the
          // body so we can surface the real error message from the function.
          const ctx = (error as { context?: Response }).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json().catch(() => null);
            if (body?.error) throw new Error(body.error);
          }
          throw error;
        }
        if (data?.error) throw new Error(data.error);

        const detected: DetectedFood[] = (data.foods || []).map((f: any, i: number) => ({
          id: crypto.randomUUID(),
          name: f.name,
          portion: Math.round(f.portion ?? 100),
          unit: "g",
          calories: Math.round(f.calories ?? 0),
          protein: Math.round(f.protein ?? 0),
          carbs: Math.round(f.carbs ?? 0),
          fat: Math.round(f.fat ?? 0),
          saturatedFat: Math.round(f.saturatedFat ?? 0),
          sodium: Math.round(f.sodium ?? 0),
          fiber: Math.round(f.fiber ?? 0),
          addedSugars: Math.round(f.addedSugars ?? 0),
          source: "vision" as const,
        }));

        setFoods(detected);
        setStep("review");

        if (detected.length === 0) {
          toast.info("No foods detected. Try adding items manually.");
        } else {
          toast.success(`Detected ${detected.length} food${detected.length > 1 ? "s" : ""}`);
        }
      } catch (err) {
        console.error("Food detection failed:", err);
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`Detection failed: ${msg}. You can add items manually.`);
        setFoods([]);
        setStep("review");
      }
    };
    reader.readAsDataURL(file);
  };

  const updatePortion = (id: string, delta: number) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const newPortion = Math.max(10, f.portion + delta);
        const ratio = newPortion / f.portion;
        return {
          ...f,
          portion: newPortion,
          calories: Math.round(f.calories * ratio),
          protein: Math.round(f.protein * ratio),
          carbs: Math.round(f.carbs * ratio),
          fat: Math.round(f.fat * ratio),
          saturatedFat: Math.round(f.saturatedFat * ratio),
          sodium: Math.round(f.sodium * ratio),
          fiber: Math.round(f.fiber * ratio),
          addedSugars: Math.round(f.addedSugars * ratio),
        };
      })
    );
  };

  const removeFood = (id: string) => setFoods((prev) => prev.filter((f) => f.id !== id));

  const addFood = () => {
    setFoods((prev) => [...prev, { ...emptyFood, id: crypto.randomUUID() }]);
  };

  const updateFoodName = (id: string, name: string) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const lookupNutrition = useCallback(async (id: string) => {
    const food = foods.find((f) => f.id === id);
    if (!food || !food.name.trim()) {
      toast.error("Please enter a food name first");
      return;
    }

    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, isLookingUp: true } : f)));

    try {
      const { data, error } = await supabase.functions.invoke("lookup-food", {
        body: { foodName: food.name.trim(), portionGrams: food.portion },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setFoods((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                calories: Math.round(data.calories ?? 0),
                protein: Math.round(data.protein ?? 0),
                carbs: Math.round(data.carbs ?? 0),
                fat: Math.round(data.fat ?? 0),
                saturatedFat: Math.round(data.saturatedFat ?? 0),
                sodium: Math.round(data.sodium ?? 0),
                fiber: Math.round(data.fiber ?? 0),
                addedSugars: Math.round(data.addedSugars ?? 0),
                source: data.source ?? "ai",
                isLookingUp: false,
              }
            : f
        )
      );

      const sourceLabel = data.source === "usda" ? "USDA" : "AI";
      toast.success(`${food.name} — nutrition loaded (${sourceLabel})`);
    } catch (err) {
      console.error("Nutrition lookup failed:", err);
      toast.error("Failed to look up nutrition. Try again.");
      setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, isLookingUp: false } : f)));
    }
  }, [foods]);

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
      saturatedFat: acc.saturatedFat + f.saturatedFat,
      sodium: acc.sodium + f.sodium,
      fiber: acc.fiber + f.fiber,
      addedSugars: acc.addedSugars + f.addedSugars,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, saturatedFat: 0, sodium: 0, fiber: 0, addedSugars: 0 }
  );

  const handleConfirm = async () => {
    setStep("confirm");
    try {
      await addMeal.mutateAsync({
        type: mealType,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        saturated_fat: totals.saturatedFat,
        sodium: totals.sodium,
        fiber: totals.fiber,
        added_sugars: totals.addedSugars,
        foods: foods.map((f) => ({
          name: f.name,
          portion: f.portion,
          unit: f.unit,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          saturatedFat: f.saturatedFat,
          sodium: f.sodium,
          fiber: f.fiber,
          addedSugars: f.addedSugars,
        })),
        image_url: null,
      });
    } catch (err) {
      console.error("Failed to save meal:", err);
      toast.error("Couldn't save meal — try again.");
    } finally {
      setTimeout(() => navigate("/today"), 1500);
    }
  };

  return (
    <div className="min-h-screen bottom-nav-safe">
      {step !== "upload" && (
        <>
          {/* Header for non-upload steps */}
          <div className="flex items-center gap-3 px-5 pt-12 pb-4">
            <button onClick={() => navigate(-1)} className="p-1 text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold font-display text-foreground">Add Meal</h1>
          </div>

          {/* Meal type selector */}
          <div className="flex gap-2 px-5 mb-5 overflow-x-auto no-scrollbar">
            {mealTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setMealType(t.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  mealType === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-zinc-900 via-stone-900 to-zinc-800 text-white"
            style={{ minHeight: "100dvh" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors active:bg-white/25"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors active:bg-white/25"
                aria-label="Flash"
              >
                <Zap className="h-5 w-5" />
              </button>
            </div>

            {/* Camera viewfinder area */}
            <div className="relative flex flex-1 flex-col items-center justify-center px-6">
              {/* Soft glow */}
              <div className="absolute inset-0 bg-gradient-radial from-amber-400/20 via-transparent to-transparent blur-3xl" />

              {/* Focus circle (decorative viewfinder) */}
              <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                <span className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-white/70" />
                <span className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-white/70" />
                <span className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-white/70" />
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-white/70" />
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                  <Camera className="h-9 w-9" strokeWidth={1.8} />
                </div>
              </div>

              <p className="relative mt-6 text-center text-sm text-white/70">
                Tap the shutter to scan your meal
              </p>

              {/* Mode pills under the circle */}
              <div className="relative mt-6 flex items-center gap-2 rounded-full bg-white/10 p-1 backdrop-blur-md">
                <ModeButton
                  active
                  icon={<Camera className="h-4 w-4" />}
                  label="Meal"
                  onClick={() => {/* default */}}
                />
                <ModeButton
                  icon={<Barcode className="h-4 w-4" />}
                  label="Label"
                  onClick={() => toast.info("Barcode scan — coming soon")}
                />
                <ModeButton
                  icon={<Keyboard className="h-4 w-4" />}
                  label="Type"
                  onClick={() => toast.info("Manual search — coming soon")}
                />
              </div>
            </div>

            {/* Bottom controls: Gallery · Shutter · placeholder */}
            <div className="relative flex items-center justify-around px-8 pb-12 pt-2">
              <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md transition-colors active:bg-white/20">
                <ImageIcon className="h-6 w-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Shutter button — large white circle */}
              <label className="relative cursor-pointer">
                <span className="block h-20 w-20 rounded-full border-[5px] border-white/80 bg-transparent p-1.5 transition-transform active:scale-95">
                  <span className="block h-full w-full rounded-full bg-white" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Spacer to balance Gallery on the left */}
              <span className="h-14 w-14" aria-hidden />
            </div>
          </motion.div>
        )}

        {step === "detecting" && (
          <motion.div
            key="detecting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-5"
          >
            {imagePreview && (
              <div className="rounded-2xl overflow-hidden mb-4">
                <img src={imagePreview} alt="Meal" className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Analyzing your meal...</p>
              <p className="text-xs text-muted-foreground">AI is detecting foods in your photo</p>
            </div>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-5"
          >
            {imagePreview && (
              <div className="rounded-2xl overflow-hidden mb-4 relative">
                <img src={imagePreview} alt="Meal" className="w-full h-36 object-cover" />
              </div>
            )}

            <h2 className="text-base font-semibold font-display text-foreground mb-3">
              {foods.length > 0 ? "Detected Foods" : "Add Foods"}
            </h2>

            <div className="space-y-3 mb-5">
              {foods.map((food) => (
                <div key={food.id} className="glass-card rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={food.name}
                        onChange={(e) => updateFoodName(food.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") lookupNutrition(food.id);
                        }}
                        placeholder="Type food name..."
                        className="flex-1 text-sm font-medium text-foreground bg-transparent border-b border-border focus:border-primary outline-none pb-0.5 placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={() => lookupNutrition(food.id)}
                        disabled={food.isLookingUp || !food.name.trim()}
                        className="p-1 rounded-md text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Look up nutrition"
                      >
                        {food.isLookingUp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button onClick={() => removeFood(food.id)} className="p-0.5 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => updatePortion(food.id, -25)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3 text-secondary-foreground" />
                    </button>
                    <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
                      {food.portion}{food.unit}
                    </span>
                    <button
                      onClick={() => updatePortion(food.id, 25)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-secondary-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{food.calories} cal</span>
                    <span className="text-macro-protein">P {food.protein}g</span>
                    <span className="text-macro-carbs">C {food.carbs}g</span>
                    <span className="text-macro-fat">F {food.fat}g</span>
                    {food.source && (
                      <span className="ml-auto text-[10px] uppercase tracking-wide opacity-60">
                        {food.source === "usda" ? "USDA" : food.source === "vision" ? "AI Vision" : "AI"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addFood}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 hover:bg-secondary transition-colors mb-5"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>

            {/* Totals */}
            {foods.length > 0 && (
              <div className="glass-card rounded-xl p-4 mb-5">
                <h3 className="text-sm font-semibold font-display text-foreground mb-3">Meal Totals</h3>
                <div className="space-y-2">
                  <MacroBar value={totals.calories} target={2400} color="calories" label="Calories" unit=" cal" />
                  <MacroBar value={totals.protein} target={130} color="protein" label="Protein" />
                  <MacroBar value={totals.carbs} target={300} color="carbs" label="Carbs" />
                  <MacroBar value={totals.fat} target={80} color="fat" label="Fat" />
                  <MacroBar value={totals.saturatedFat} target={22} color="saturated-fat" label="Sat. Fat" />
                  <MacroBar value={totals.sodium} target={2300} color="sodium" label="Sodium" unit=" mg" />
                  <MacroBar value={totals.fiber} target={30} color="fiber" label="Fiber" />
                  <MacroBar value={totals.addedSugars} target={30} color="added-sugars" label="Added Sugars" />
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={foods.length === 0}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Confirm Meal
            </button>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4"
            >
              <Check className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <p className="text-lg font-semibold font-display text-foreground">Meal Logged!</p>
            <p className="text-sm text-muted-foreground mt-1">{totals.calories} calories added</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-white text-zinc-900" : "text-white/80 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
