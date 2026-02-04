import { Suspense } from "react";
import LoginPage from "@/components/login";

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPage />
    </Suspense>
  );
}
