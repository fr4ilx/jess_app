import { IntroScreen } from "@/components/onboarding/intro/IntroScreen";
import { WidgetInsights } from "@/components/onboarding/intro/WidgetInsights";

export default function IntroInsights() {
  return (
    <IntroScreen
      eyebrow="WEEKLY INSIGHTS"
      widget={<WidgetInsights />}
      headlineLead="See your"
      headlineItalic="patterns"
      body="Weekly trends show what's working — and where to adjust before plateaus set in."
      ctaLabel="Continue"
      nextPath="/onboarding/intro/targets"
      index={3}
      total={5}
    />
  );
}
