import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { LayoutCanvas } from "@/components/layout/LayoutCanvas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  return <LayoutCanvas />;
}