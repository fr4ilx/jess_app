import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

// Public + auth pages
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import Today from "./pages/Today";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

// New onboarding flow — "About you" split into 5 single-input screens
import PersonalName from "./pages/onboarding/PersonalName";
import PersonalAge from "./pages/onboarding/PersonalAge";
import PersonalSex from "./pages/onboarding/PersonalSex";
import PersonalHeight from "./pages/onboarding/PersonalHeight";
import PersonalWeight from "./pages/onboarding/PersonalWeight";
import ActivityGoal from "./pages/onboarding/ActivityGoal";
import Glp1Question from "./pages/onboarding/Glp1Question";
import Glp1Details from "./pages/onboarding/Glp1Details";
import TargetsReveal from "./pages/onboarding/TargetsReveal";
import PandaWelcome from "./pages/onboarding/PandaWelcome";

// Design Option 3 — App Store-style intro carousel (sage green)
import IntroProgressPhotos from "./pages/onboarding/intro/IntroProgressPhotos";
import IntroMedication from "./pages/onboarding/intro/IntroMedication";
import IntroFoodLog from "./pages/onboarding/intro/IntroFoodLog";
import IntroInsights from "./pages/onboarding/intro/IntroInsights";
import IntroTargets from "./pages/onboarding/intro/IntroTargets";

// Existing app pages (Dashboard now redirects to /today; the file is kept for
// reference but no longer routed to)
import AddMeal from "./pages/AddMeal";
import WeeklyInsights from "./pages/WeeklyInsights";
import Profile from "./pages/Profile";
import MealDetail from "./pages/MealDetail";
import Coach from "./pages/Coach";
import LogShot from "./pages/LogShot";
import LogWeight from "./pages/LogWeight";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-lg mx-auto relative">
            <Routes>
              {/* Public entry */}
              <Route path="/" element={<Splash />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              {/* Intro carousel (no OnboardingLayout — full-bleed) */}
              <Route path="/onboarding/intro/photos" element={<IntroProgressPhotos />} />
              <Route path="/onboarding/intro/medication" element={<IntroMedication />} />
              <Route path="/onboarding/intro/food" element={<IntroFoodLog />} />
              <Route path="/onboarding/intro/insights" element={<IntroInsights />} />
              <Route path="/onboarding/intro/targets" element={<IntroTargets />} />

              {/* Sandbox mode: onboarding + /today are publicly accessible so the
                  flow can be walked without signing up. If a session exists,
                  PandaWelcome still writes to Supabase at the end. */}
              <Route element={<OnboardingLayout />}>
                <Route path="/onboarding/name" element={<PersonalName />} />
                <Route path="/onboarding/age" element={<PersonalAge />} />
                <Route path="/onboarding/sex" element={<PersonalSex />} />
                <Route path="/onboarding/height" element={<PersonalHeight />} />
                <Route path="/onboarding/weight" element={<PersonalWeight />} />
                <Route path="/onboarding/activity" element={<ActivityGoal />} />
                <Route path="/onboarding/glp1" element={<Glp1Question />} />
                <Route path="/onboarding/glp1-details" element={<Glp1Details />} />
                <Route path="/onboarding/targets" element={<TargetsReveal />} />
              </Route>
              {/* PandaWelcome opts out of the OnboardingLayout (no top bar, full-screen celebratory) */}
              <Route path="/onboarding/welcome-panda" element={<PandaWelcome />} />
              <Route path="/today" element={<Today />} />

              {/* /dashboard now redirects to /today (legacy path kept for old links) */}
              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route path="/add-meal" element={<AddMeal />} />
              <Route path="/insights" element={<WeeklyInsights />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/log-shot" element={<LogShot />} />
              <Route path="/log-weight" element={<LogWeight />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/meal/:id" element={<MealDetail />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
