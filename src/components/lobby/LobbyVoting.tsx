"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantList, type Participant } from "./ParticipantList";
import { RankingProposer } from "./RankingProposer";
import { VotingPanel, type VoteEntry, type ProposedRankingEntry } from "./VotingPanel";

type LobbyVotingProps = {
  lobbyId: string;
  code: string;
  jogo: string;
  hostId: string;
  fotoUrl: string | null;
  votingExpiresAt: string | null;
  participants: Participant[];
  currentUserId: string;
  proposedRanking: { position: number; userId: string | null; playerName: string; version: number; proposedBy: { id: string; name: string | null } }[];
  votes: { userId: string; status: string; version: number }[];
  onLeave: () => void;
  onLobbyUpdated: () => void;
};

export function LobbyVoting({
  lobbyId,
  code: _code,
  jogo,
  hostId,
  fotoUrl,
  participants,
  currentUserId,
  proposedRanking,
  votes,
  onLeave,
  onLobbyUpdated,
}: LobbyVotingProps) {
  const [leaving, setLeaving] = useState(false);

  const latestVersion = Math.max(0, ...proposedRanking.map((r) => r.version));
  const latestRanking = proposedRanking
    .filter((r) => r.version === latestVersion)
    .sort((a, b) => a.position - b.position) as ProposedRankingEntry[];
  const proposedBy = proposedRanking.find((r) => r.version === latestVersion)?.proposedBy?.name ?? undefined;
  const votesForVersion: VoteEntry[] = votes
    .filter((v) => v.version === latestVersion)
    .map((v) => ({ userId: v.userId, status: v.status as VoteEntry["status"] }));

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
      </div>

      {fotoUrl && (
        <div className="rounded-lg border overflow-hidden">
          <img
            src={fotoUrl}
            alt="Foto da partida"
            className="w-full max-h-64 object-contain bg-muted"
          />
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Participantes</h3>
        <ParticipantList
          participants={participants}
          currentUserId={currentUserId}
          hostId={hostId}
        />
      </div>

      {latestVersion > 0 ? (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-3">Votação</h3>
          <VotingPanel
            lobbyId={lobbyId}
            currentUserId={currentUserId}
            version={latestVersion}
            ranking={latestRanking}
            votes={votesForVersion}
            proposedByName={proposedBy}
            onVoteCast={onLobbyUpdated}
          />
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium mb-3">Propor ranking</h3>
        <RankingProposer
          lobbyId={lobbyId}
          participants={participants.map((p) => ({
            userId: p.userId,
            user: {
              id: p.user.id,
              steamUsername: p.user.steamUsername,
              name: p.user.name,
            },
          }))}
          currentVersion={latestVersion}
          onProposed={onLobbyUpdated}
        />
      </div>

      <Button
        variant="outline"
        onClick={handleLeave}
        disabled={leaving}
      >
        {leaving ? "Saindo…" : "Sair do lobby"}
      </Button>
    </div>
  );
}
