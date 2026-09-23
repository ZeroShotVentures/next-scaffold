import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Page() {
  redirect((await getSession()) ? "/dashboard" : "/sign-in");
}
