import { Home } from "@/components/home";
import { env } from "@/env";
import { emailEnabled, googleEnabled } from "@/lib/features";

export default function Page() {
  return (
    <Home
      billingEnabled={env.BILLING_ENABLED}
      googleEnabled={googleEnabled}
      emailEnabled={emailEnabled}
    />
  );
}
