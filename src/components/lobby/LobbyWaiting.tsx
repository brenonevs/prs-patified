"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantList, type Participant } from "./ParticipantList";
import { MIN_PLAYERS_TO_START } from "@/lib/lobby-utils";

type LobbyWaitingProps = {
  lobbyId: string;
  code: string;
  jogo: string;
  hostId: string;
  participants: Participant[];
  currentUserId: string;
  isHost: boolean;
  onLeave: () => void;
  onLobbyUpdated: () => void;
};

export function LobbyWaiting({
  lobbyId,
  code,
  jogo,
  hostId,
  participants,
  currentUserId,
  isHost,
  onLeave,
  onLobbyUpdated,
}: LobbyWaitingProps) {
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const canStart = isHost && participants.length >= MIN_PLAYERS_TO_START;
  const myParticipation = participants.find((p) => p.userId === currentUserId);
  const [readyLoading, setReadyLoading] = useState(false);

  const handleReady = async () => {
    setReadyLoading(true);
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/ready`, {
        method: "POST",
      });
      if (res.ok) onLobbyUpdated();
    } finally {
      setReadyLoading(false);
    }
  };

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/start`, {
        method: "POST",
      });
      if (res.ok) onLobbyUpdated();
    } finally {
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/leave`, {
        method: "POST",
      });
      if (res.ok) onLeave();
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Jogo</p>
        <p className="font-medium">{jogo}</p>
        <p className="text-sm text-muted-foreground mt-2">Código da sala</p>
        <p className="font-mono text-lg font-semibold tracking-wider">{code}</p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Participantes ({participants.length})</h3>
        <ParticipantList
          participants={participants}
          currentUserId={currentUserId}
          hostId={hostId}
          className="mb-4"
        />
        {isHost && participants.length < MIN_PLAYERS_TO_START && (
          <p className="text-sm text-muted-foreground">
            Mínimo de {MIN_PLAYERS_TO_START} jogadores para iniciar.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!isHost && (
          <Button
            variant={myParticipation?.isReady ? "secondary" : "outline"}
            onClick={handleReady}
            disabled={readyLoading}
          >
            {readyLoading ? "…" : myParticipation?.isReady ? "Pronto ✓" : "Estou pronto"}
          </Button>
        )}
        {isHost && (
          <Button
            onClick={handleStart}
            disabled={!canStart || starting}
          >
            {starting ? "Iniciando…" : "Iniciar partida"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleLeave}
          disabled={leaving}
        >
          {leaving ? "Saindo…" : "Sair do lobby"}
        </Button>
      </div>
    </div>
  );
}
