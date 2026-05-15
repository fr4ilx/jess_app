import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { calculateTargets, type Activity, type Goal, type Sex } from "@/lib/calculateTargets";
import { useCurrentProfile, type CurrentProfile } from "@/hooks/useCurrentProfile";
import { useOnboardingStore } from "@/store/onboarding";
import { useSaveOnboardingStep } from "@/hooks/useSaveOnboardingStep";

type EditableProfile = {
  name: string;
  age: number;
  sex: Sex;
  height_cm: number;
  weight_kg: number;
  activity: Activity;
  goal: Goal;
};

const FALLBACK: EditableProfile = {
  name: "",
  age: 30,
  sex: "male",
  height_cm: 175,
  weight_kg: 75,
  activity: "moderate",
  goal: "maintain",
};

function fromCurrent(c: CurrentProfile): EditableProfile {
  return {
    name: c.name ?? "",
    age: c.age ?? FALLBACK.age,
    sex: c.sex ?? FALLBACK.sex,
    height_cm: c.height_cm ?? FALLBACK.height_cm,
    weight_kg: c.weight_kg ?? FALLBACK.weight_kg,
    activity: c.activity ?? FALLBACK.activity,
    goal: c.goal ?? FALLBACK.goal,
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const current = useCurrentProfile();
  const setField = useOnboardingStore((s) => s.setField);
  const { save, isPending } = useSaveOnboardingStep();
  const [profile, setProfile] = useState<EditableProfile>(() => fromCurrent(current));

  const targets = calculateTargets({
    age: profile.age,
    sex: profile.sex,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    activity: profile.activity,
    goal: profile.goal,
  });

  const update = <K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    // Mirror local edits to Zustand so /today + other consumers refresh.
    setField("name", profile.name);
    setField("age", profile.age);
    setField("sex", profile.sex);
    setField("height_cm", profile.height_cm);
    setField("weight_kg", profile.weight_kg);
    setField("activity", profile.activity);
    setField("goal", profile.goal);
    await save();
    toast.success("Profile saved");
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-1 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-display text-foreground">Profile</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 space-y-4">
        {/* Basic info */}
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold font-display text-foreground">Personal Info</h2>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => update("age", Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sex</label>
              <select
                value={profile.sex}
                onChange={(e) => update("sex", e.target.value as Sex)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
              <input
                type="number"
                value={profile.height_cm}
                onChange={(e) => update("height_cm", Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
              <input
                type="number"
                value={profile.weight_kg}
                onChange={(e) => update("weight_kg", Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Activity & Goal */}
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold font-display text-foreground">Activity & Goal</h2>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Activity Level</label>
            <div className="grid grid-cols-2 gap-2">
              {(["sedentary", "light", "moderate", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => update("activity", level)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                    profile.activity === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "lose-safe", label: "Lose Weight" },
                { value: "maintain", label: "Maintain" },
                { value: "maintain-after-loss", label: "Maintain After Loss" },
                { value: "heart-focus", label: "Heart Focus" },
              ] as const).map((g) => (
                <button
                  key={g.value}
                  onClick={() => update("goal", g.value)}
                  className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    profile.goal === g.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Computed Targets */}
        <div className="glass-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold font-display text-foreground mb-3">Your Daily Targets</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-macro-calories/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.calories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="bg-macro-protein/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.protein}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="bg-macro-carbs/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.carbs}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="bg-macro-fat/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.fat}g</p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
            <div className="bg-macro-saturated-fat/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.satFat}g</p>
              <p className="text-xs text-muted-foreground">Sat. Fat</p>
            </div>
            <div className="bg-macro-sodium/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.sodium}mg</p>
              <p className="text-xs text-muted-foreground">Sodium</p>
            </div>
            <div className="bg-macro-fiber/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.fiber}g</p>
              <p className="text-xs text-muted-foreground">Fiber</p>
            </div>
            <div className="bg-macro-added-sugars/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold font-display text-foreground">{targets.addedSugars}g</p>
              <p className="text-xs text-muted-foreground">Added Sugars</p>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Saving…" : "Save Profile"}
        </button>
      </motion.div>
    </div>
  );
}
