import { notFound } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const params = await searchParams;
  const secret = process.env.ADMIN_SECRET_KEY;

  if (!secret || params.k !== secret) {
    notFound();
  }

  return <LoginForm />;
}
