import { redirect } from "next/navigation";
import { getJudgeSession } from "@/server/auth/judge-session";
import { JudgeLoginForm } from "@/features/judge/login-form";

export const instant = false;

export default async function JudgeLoginPage() {
  const session = await getJudgeSession();
  if (session) redirect("/judge");

  return (
    <div className="mx-auto max-w-md">
      <JudgeLoginForm />
    </div>
  );
}
