import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sampleProfile, calculateTargets, type UserProfile } from "@/lib/nutrition";
import { useCurrentProfile, type CurrentProfile } from "@/hooks/useCurrentProfile";

// Bridges the new Zustand onboarding state to the legacy UserProfile shape used
// by this editor. Lossy on sex (only male/female supported here) and goal
// (collapses 4 onboarding goals → 3 legacy goals).
function deriveLegacyProfile(c: CurrentProfile): UserProfile {
  const sex: UserProfile["sex"] = c.sex === "male" ? "male" : "female";
  const goal: UserProfile["goal"] = c.goal === "lose-safe" ? "lose" : "maintain";
  return {
    name: c.name || sampleProfile.name,
    age: c.age ?? sampleProfile.age,
    sex,
    height: c.height_cm ?? sampleProfile.height,
    weight: c.weight_kg ?? sampleProfile.weight,
    activityLevel: c.activity ?? sampleProfile.activityLevel,
    goal,
    allowImageStorage: true,
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const current = useCurrentProfile();
  const [profile, setProfile] = useState<UserProfile>(() =>
    current.hasProfileData ? deriveLegacyProfile(current) : sampleProfile
  );
  const [saved, setSaved] = useState(false);
  const targets = calculateTargets(profile);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                onChange={(e) => update("sex", e.target.value as "male" | "female")}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => update("height", Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => update("weight", Number(e.target.value))}
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
                  onClick={() => update("activityLevel", level)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                    profile.activityLevel === level
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
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "lose", label: "Lose Weight" },
                { value: "maintain", label: "Maintain" },
                { value: "gain", label: "Gain Muscle" },
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
              <p className="text-xl font-bold font-display text-foreground">{targets.saturatedFat}g</p>
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

        {/* Custom Nutrient Goals */}
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold font-display text-foreground">Custom Nutrient Goals</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Leave blank to use calculated defaults</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sat. Fat (g)</label>
              <input
                type="number"
                placeholder={`${targets.saturatedFat}`}
                value={profile.customSaturatedFat ?? ""}
                onChange={(e) => update("customSaturatedFat", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sodium (mg)</label>
              <input
                type="number"
                placeholder={`${targets.sodium}`}
                value={profile.customSodium ?? ""}
                onChange={(e) => update("customSodium", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fiber (g)</label>
              <input
                type="number"
                placeholder={`${targets.fiber}`}
                value={profile.customFiber ?? ""}
                onChange={(e) => update("customFiber", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Added Sugars (g)</label>
              <input
                type="number"
                placeholder={`${targets.addedSugars}`}
                value={profile.customAddedSugars ?? ""}
                onChange={(e) => update("customAddedSugars", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Allow meal image storage</p>
            <p className="text-xs text-muted-foreground">Store photos for meal history</p>
          </div>
          <button
            onClick={() => update("allowImageStorage", !profile.allowImageStorage)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              profile.allowImageStorage ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-transform ${
                profile.allowImageStorage ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </motion.div>
    </div>
  );
}
