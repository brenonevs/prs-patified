"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, Home, Loader2 } from "lucide-react";

type LobbyCompletedProps = {
  lobbyId: string;
  code: string;
  partidaId: string | null;
  isHost: boolean;
  onLobbyUpdated: () => void;
  onLeave: () => void;
};

export function LobbyCompleted({
  lobbyId,
  code,
  partidaId,
  isHost,
  onLobbyUpdated,
  onLeave,
}: LobbyCompletedProps) {
  const router = useRouter();
  const [restarting, setRestarting] = useState(false);
  const [error, setError] = useState("");

  const handleRestart = async () => {
    setRestarting(true);
    setError("");
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/restart`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao reiniciar lobby.");
        return;
      }
      onLobbyUpdated();
    } finally {
      setRestarting(false);
    }
  };

  return (
    <Card className="text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <Trophy className="size-8 text-green-500" />
        </div>
        <CardTitle className="text-2xl">🎉 Partida registrada!</CardTitle>
        <CardDescription className="text-base">
          O ranking foi salvo com sucesso. Que tal jogar mais uma?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-3">
          {isHost ? (
            <Button
              onClick={handleRestart}
              disabled={restarting}
              size="lg"
              className="w-full"
            >
              {restarting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Reiniciando…
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  🐥 Jogar outra partida
                </>
              )}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Aguardando o host iniciar outra partida…
            </p>
          )}

          {partidaId && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push("/dashboard/ranking")}
            >
              <Trophy className="size-4" />
              Ver ranking
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onLeave}
          >
            <Home className="size-4" />
            Voltar aos lobbies
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Código da sala: <span className="font-mono font-bold">{code}</span>
        </p>
      </CardContent>
    </Card>
  );
}
