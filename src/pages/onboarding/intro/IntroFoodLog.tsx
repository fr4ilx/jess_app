import { IntroScreen } from "@/components/onboarding/intro/IntroScreen";
import { WidgetFoodLog } from "@/components/onboarding/intro/WidgetFoodLog";

export default function IntroFoodLog() {
  return (
    <IntroScreen
      eyebrow="FOOD LOGGING"
      widget={<WidgetFoodLog />}
      headlineLead="Snap, log,"
      headlineItalic="done"
      body="Photograph any meal and we'll handle macros, calories, and portion sizing for you in seconds."
      ctaLabel="Continue"
      nextPath="/onboarding/intro/insights"
      index={2}
      total={5}
    />
  );
}
