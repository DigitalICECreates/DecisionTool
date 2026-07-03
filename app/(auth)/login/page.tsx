import { AuthShell } from "@/components/auth/AuthShell";
import { LoginSignup } from "@/components/auth/LoginSignup";

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginSignup initialMode="login" />
    </AuthShell>
  );
}
