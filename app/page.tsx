import { redirect } from "next/navigation";

// Root just routes to the app; middleware decides login vs dashboard.
export default function Home() {
  redirect("/dashboard");
}
