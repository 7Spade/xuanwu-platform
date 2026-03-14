import { redirect } from "next/navigation";

/** Register tab is embedded in the login page. */
export default function RegisterPage() {
  redirect("/login");
}
