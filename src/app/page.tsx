import { Home } from "@/components/home";
import { env } from "@/env";

export default function Page() {
  return <Home billingEnabled={env.BILLING_ENABLED} />;
}
