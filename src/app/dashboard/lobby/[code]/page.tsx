"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type Pusher from "pusher-js";
import { getPusherClient, getLobbyChannelName } from "@/lib/pusher-client";
import { LobbyWaiting } from "@/components/lobby/LobbyWaiting";
import { LobbyInProgress } from "@/components/lobby/LobbyInProgress";
import { LobbyVoting } from "@/components/lobby/LobbyVoting";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import type { Participant } from "@/components/lobby/ParticipantList";

type LobbyState = {
  id: string;
  code: string;
  jogo: string;
  status: string;
  hostId: string;
  fotoUrl: string | null;
  votingStartedAt: string | null;
  votingExpiresAt: string | null;
  partidaId: string | null;
  currentUserId: string;
  host: { id: string; name: string | null; image: string | null; steamUsername: string | null };
  participants: {
    userId: string;
    isReady: boolean;
    user: { id: string; name: string | null; image: string | null; steamUsername: string | null };
  }[];
  proposedRanking: {
    position: number;
    userId: string | null;
    playerName: string;
    version: number;
    proposedBy: { id: string; name: string | null };
  }[];
  votes: { userId: string; status: string; version: number }[];
};

export default function LobbyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params.code === "string" ? params.code.toUpperCase() : "";
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLobby = useCallback(async () => {
    if (!code) return;
    setError("");
    try {
      const res = await fetch(`/api/lobbies?code=${encodeURIComponent(code)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLobby(null);
        setError(data.error ?? "Erro ao carregar lobby.");
        return;
      }
      setLobby(data);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchLobby();
  }, [fetchLobby]);

  useEffect(() => {
    if (!code || !lobby) return;
    const channelName = getLobbyChannelName(code);
    const pusher = getPusherClient();
    const handler = () => {
      fetchLobby();
    };

    let channel: ReturnType<Pusher["subscribe"]> | null = null;
    if (pusher) {
      channel = pusher.subscribe(channelName);
      channel.bind("participant_joined", handler);
      channel.bind("participant_left", handler);
      channel.bind("participant_ready", handler);
      channel.bind("host_changed", handler);
      channel.bind("lobby_started", handler);
      channel.bind("photo_uploaded", handler);
      channel.bind("voting_started", handler);
      channel.bind("ranking_proposed", handler);
      channel.bind("vote_cast", handler);
      channel.bind("voting_completed", handler);
      channel.bind("lobby_cancelled", handler);
      channel.bind("lobby_expired", handler);
    }

    const pollInterval = setInterval(fetchLobby, 5000);

    return () => {
      clearInterval(pollInterval);
      if (channel) {
        channel.unbind_all();
        pusher?.unsubscribe(channelName);
      }
    };
  }, [code, lobby?.id, fetchLobby]);

  const participants: Participant[] =
    lobby?.participants.map((p) => ({
      userId: p.userId,
      isReady: p.isReady,
      user: p.user,
    })) ?? [];

  const handleLeave = () => {
    router.push("/dashboard/lobby");
  };

  if (loading) {
    return (
      <>
        <SiteHeader title="Lobby" />
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">Carregando…</p>
        </div>
      </>
    );
  }

  if (error || !lobby) {
    return (
      <>
        <SiteHeader title="Lobby" />
        <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] p-6">
          <p className="text-destructive">{error || "Lobby não encontrado."}</p>
          <Button variant="outline" onClick={() => router.push("/dashboard/lobby")}>
            Voltar aos lobbies
          </Button>
        </div>
      </>
    );
  }

  if (lobby.status === "COMPLETED") {
    return (
      <>
        <SiteHeader title={`Sala ${lobby.code}`} />
        <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] p-6">
          <p className="text-lg font-medium">Partida registrada com sucesso!</p>
          {lobby.partidaId && (
            <Button onClick={() => router.push("/dashboard/ranking")}>
              Ver ranking
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/dashboard/lobby")}>
            Voltar aos lobbies
          </Button>
        </div>
      </>
    );
  }

  if (lobby.status === "CANCELLED" || lobby.status === "EXPIRED") {
    return (
      <>
        <SiteHeader title={`Sala ${lobby.code}`} />
        <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] p-6">
          <p className="text-muted-foreground">
            Este lobby foi {lobby.status === "CANCELLED" ? "cancelado" : "expirado"}.
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard/lobby")}>
            Voltar aos lobbies
          </Button>
        </div>
      </>
    );
  }

  const isHost = lobby.currentUserId === lobby.hostId;

  if (lobby.status === "WAITING") {
    return (
      <>
        <SiteHeader title={`Sala ${lobby.code}`} />
        <div className="p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Sala {lobby.code}</h1>
          <LobbyWaiting
          lobbyId={lobby.id}
          code={lobby.code}
          jogo={lobby.jogo}
          hostId={lobby.hostId}
          participants={participants}
          currentUserId={lobby.currentUserId}
          isHost={isHost}
          onLeave={handleLeave}
          onLobbyUpdated={fetchLobby}
        />
        </div>
      </>
    );
  }

  if (lobby.status === "IN_PROGRESS") {
    return (
      <>
        <SiteHeader title={`Sala ${lobby.code}`} />
        <div className="p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Partida em andamento</h1>
          <LobbyInProgress
          lobbyId={lobby.id}
          code={lobby.code}
          jogo={lobby.jogo}
          hostId={lobby.hostId}
          participants={participants}
          currentUserId={lobby.currentUserId}
          isHost={isHost}
          onLeave={handleLeave}
          onLobbyUpdated={fetchLobby}
        />
        </div>
      </>
    );
  }

  if (lobby.status === "VOTING") {
    return (
      <>
        <SiteHeader title={`Sala ${lobby.code}`} />
        <div className="p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Votação do ranking</h1>
          <LobbyVoting
          lobbyId={lobby.id}
          code={lobby.code}
          jogo={lobby.jogo}
          hostId={lobby.hostId}
          fotoUrl={lobby.fotoUrl}
          votingExpiresAt={lobby.votingExpiresAt}
          participants={participants}
          currentUserId={lobby.currentUserId}
          proposedRanking={lobby.proposedRanking}
          votes={lobby.votes}
          onLeave={handleLeave}
          onLobbyUpdated={fetchLobby}
        />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title={`Sala ${lobby.code}`} />
      <div className="p-6">
        <p className="text-muted-foreground">Estado desconhecido: {lobby.status}</p>
      </div>
    </>
  );
}
