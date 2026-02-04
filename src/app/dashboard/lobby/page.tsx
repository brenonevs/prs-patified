"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, ArrowRight } from "lucide-react";

export default function LobbyHubPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 6) {
      setJoinError("Digite um código de 6 caracteres.");
      return;
    }
    setJoinError("");
    setJoinLoading(true);
    try {
      const res = await fetch("/api/lobbies/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setJoinError(data.error ?? "Erro ao entrar no lobby.");
        return;
      }
      router.push(`/dashboard/lobby/${data.code}`);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreateError("");
    setCreateLoading(true);
    try {
      const res = await fetch("/api/lobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogo: "Straftat" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data.error ?? "Erro ao criar lobby.");
        return;
      }
      router.push(`/dashboard/lobby/${data.code}`);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Lobbies</h1>
          <p className="text-muted-foreground mt-1">
            Crie uma sala ou entre com o código para registrar uma partida em grupo com votação.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              Criar lobby
            </CardTitle>
            <CardDescription>
              Inicie uma nova sala. Outros entram pelo código.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {createError && (
              <p className="text-sm text-destructive mb-3">{createError}</p>
            )}
            <Button
              onClick={handleCreate}
              disabled={createLoading}
              className="w-full"
            >
              {createLoading ? "Criando…" : "Criar lobby"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Entrar no lobby
            </CardTitle>
            <CardDescription>
              Digite o código de 6 caracteres compartilhado pelo host.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {joinError && (
              <p className="text-sm text-destructive">{joinError}</p>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Ex: ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                className="font-mono uppercase"
              />
              <Button
                onClick={handleJoin}
                disabled={joinLoading || code.trim().length !== 6}
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
