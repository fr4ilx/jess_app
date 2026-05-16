import { IntroScreen } from "@/components/onboarding/intro/IntroScreen";
import { WidgetProgressPhotos } from "@/components/onboarding/intro/WidgetProgressPhotos";

export default function IntroProgressPhotos() {
  return (
    <IntroScreen
      eyebrow="PROGRESS PHOTOS"
      widget={<WidgetProgressPhotos />}
      headlineLead="Visualize your"
      headlineItalic="transformation"
      body="Side-by-side progress photos with automatic weight overlays. See how far you have come."
      ctaLabel="Continue"
      nextPath="/onboarding/intro/medication"
      index={0}
      total={5}
    />
  );
}
