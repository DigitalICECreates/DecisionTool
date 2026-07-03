import { AuthShell } from "@/components/auth/AuthShell";
import { ResetFlow } from "@/components/auth/ResetFlow";

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetFlow />
    </AuthShell>
  );
}
