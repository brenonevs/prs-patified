"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantList, type Participant } from "./ParticipantList";
import { ImageUploader } from "@/components/ImageUploader";

type LobbyInProgressProps = {
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

export function LobbyInProgress({
  lobbyId,
  code: _code,
  jogo,
  hostId,
  participants,
  currentUserId,
  isHost,
  onLeave,
  onLobbyUpdated,
}: LobbyInProgressProps) {
  const [uploading, setUploading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/lobbies/${lobbyId}/photo`, {
        method: "POST",
        body: form,
      });
      if (res.ok) onLobbyUpdated();
    } finally {
      setUploading(false);
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
      </div>

      <div>
        <h3 className="font-medium mb-2">Participantes</h3>
        <ParticipantList
          participants={participants}
          currentUserId={currentUserId}
          hostId={hostId}
        />
      </div>

      {isHost && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-2">Foto de prova</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Envie a imagem do resultado. Em seguida a votação do ranking será iniciada.
          </p>
          <ImageUploader onImageSelect={handleFileSelect} />
          {uploading && (
            <p className="text-sm text-muted-foreground mt-2">Enviando…</p>
          )}
        </div>
      )}

      {!isHost && (
        <p className="text-sm text-muted-foreground">
          Aguardando o host enviar a foto de prova para iniciar a votação.
        </p>
      )}

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
