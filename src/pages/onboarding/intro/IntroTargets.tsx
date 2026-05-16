import { IntroScreen } from "@/components/onboarding/intro/IntroScreen";
import { WidgetTargets } from "@/components/onboarding/intro/WidgetTargets";

export default function IntroTargets() {
  return (
    <IntroScreen
      eyebrow="PERSONALIZED TARGETS"
      widget={<WidgetTargets />}
      headlineLead="Built around"
      headlineItalic="you"
      body="Calories and macros tailored to your body, your activity, and your GLP-1 schedule."
      ctaLabel="Let's Go"
      nextPath="/onboarding/name"
      index={4}
      total={5}
    />
  );
}
