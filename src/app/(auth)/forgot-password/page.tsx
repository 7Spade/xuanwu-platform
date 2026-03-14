import { redirect } from "next/navigation";

/** Password reset is handled as an inline dialog in the login page. */
export default function ForgotPasswordPage() {
  redirect("/login");
}
