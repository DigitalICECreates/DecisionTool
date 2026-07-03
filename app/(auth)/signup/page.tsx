import { AuthShell } from "@/components/auth/AuthShell";
import { LoginSignup } from "@/components/auth/LoginSignup";

export default function SignupPage() {
  return (
    <AuthShell>
      <LoginSignup initialMode="signup" />
    </AuthShell>
  );
}
