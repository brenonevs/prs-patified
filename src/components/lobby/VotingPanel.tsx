"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VoteEntry = {
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export type ProposedRankingEntry = {
  position: number;
  userId: string | null;
  playerName: string;
};

type VotingPanelProps = {
  lobbyId: string;
  currentUserId: string;
  version: number;
  ranking: ProposedRankingEntry[];
  votes: VoteEntry[];
  proposedByName?: string;
  onVoteCast: () => void;
};

export function VotingPanel({
  lobbyId,
  currentUserId,
  version,
  ranking,
  votes,
  proposedByName,
  onVoteCast,
}: VotingPanelProps) {
  const [voting, setVoting] = useState(false);
  const myVote = votes.find((v) => v.userId === currentUserId);

  const handleVote = async (status: "APPROVED" | "REJECTED") => {
    setVoting(true);
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/voting/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, version }),
      });
      if (res.ok) onVoteCast();
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="space-y-4">
      {proposedByName && (
        <p className="text-sm text-muted-foreground">
          Ranking proposto por <strong>{proposedByName}</strong>
        </p>
      )}
      <ol className="list-decimal list-inside space-y-1 rounded-lg border bg-card p-4">
        {ranking.map((r) => (
          <li key={r.position} className="font-medium">
            {r.playerName}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Seu voto:</span>
        {myVote?.status === "APPROVED" && (
          <span className="text-sm text-green-600 dark:text-green-400">Aprovado</span>
        )}
        {myVote?.status === "REJECTED" && (
          <span className="text-sm text-destructive">Rejeitado</span>
        )}
        {(!myVote || myVote.status === "PENDING") && (
          <>
            <Button
              size="sm"
              onClick={() => handleVote("APPROVED")}
              disabled={voting}
            >
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleVote("REJECTED")}
              disabled={voting}
            >
              Rejeitar
            </Button>
          </>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Votos:{" "}
        {votes.filter((v) => v.status === "APPROVED").length} aprovados,{" "}
        {votes.filter((v) => v.status === "REJECTED").length} rejeitados
      </div>
    </div>
  );
}
