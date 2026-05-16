import { IntroScreen } from "@/components/onboarding/intro/IntroScreen";
import { WidgetMedicationDose } from "@/components/onboarding/intro/WidgetMedicationDose";

export default function IntroMedication() {
  return (
    <IntroScreen
      eyebrow="MEDICATION TRACKING"
      widget={<WidgetMedicationDose />}
      headlineLead="Never miss"
      headlineItalic="a dose"
      body="Smart reminders timed to your schedule. Track side effects and see how your body responds over time."
      ctaLabel="Continue"
      nextPath="/onboarding/intro/food"
      index={1}
      total={5}
    />
  );
}
