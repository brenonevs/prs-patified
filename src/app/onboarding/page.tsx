"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PatifiedLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";

const GridScan = dynamic(
  () => import("@/components/GridScan").then((mod) => mod.GridScan),
  { ssr: false }
);

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [steamUsername, setSteamUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    router.replace("/login?callbackURL=/onboarding");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!steamUsername.trim()) {
      setError("Por favor, informe seu nome de usuário da Steam");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/steam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamUsername: steamUsername.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
      setIsLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      >
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-w-92 m-auto h-fit w-full px-4 py-16 md:py-32"
      >
        <div className="p-6">
          <div>
            <Link href="/" aria-label="ir para a página inicial" className="inline-flex items-center gap-2">
              <PatifiedLogo className="h-11 brightness-0 invert" />
              <span className="font-patified text-xl font-medium">Patified</span>
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Complete seu cadastro</h1>
            <p className="text-muted-foreground">
              Informe seu nome de usuário da Steam para continuar.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="steamUsername" className="text-sm font-medium">
                Nome de usuário Steam
              </label>
              <Input
                id="steamUsername"
                type="text"
                placeholder="Seu username da Steam"
                value={steamUsername}
                onChange={(e) => setSteamUsername(e.target.value)}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
