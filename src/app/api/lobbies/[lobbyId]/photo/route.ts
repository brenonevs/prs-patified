import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVotingExpiresAt } from "@/lib/lobby-utils";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";
import {
  uploadLobbyPhotoTemp,
  isGcsConfigured,
} from "@/lib/services/lobby-photo-storage";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lobbyId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { lobbyId } = await params;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    select: { id: true, code: true, hostId: true, status: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.hostId !== session.user.id) {
    return NextResponse.json(
      { error: "Apenas o host pode enviar a foto de prova." },
      { status: 403 }
    );
  }

  if (lobby.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Envie a foto apenas com a partida em andamento." },
      { status: 400 }
    );
  }

  if (!isGcsConfigured()) {
    return NextResponse.json(
      { error: "Storage não configurado. Não é possível enviar a foto." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Envie uma imagem válida (arquivo)." },
      { status: 400 }
    );
  }

  const fotoUrl = await uploadLobbyPhotoTemp(lobbyId, file);
  if (!fotoUrl) {
    return NextResponse.json(
      { error: "Erro ao guardar a foto temporariamente." },
      { status: 500 }
    );
  }

  const votingExpiresAt = getVotingExpiresAt();

  await prisma.lobby.update({
    where: { id: lobbyId },
    data: {
      fotoUrl,
      status: "VOTING",
      votingStartedAt: new Date(),
      votingExpiresAt,
    },
  });

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "photo_uploaded", {
      fotoUrl,
    });
    await pusher.trigger(getLobbyChannelName(lobby.code), "voting_started", {
      expiresAt: votingExpiresAt.toISOString(),
    });
  }

  return NextResponse.json({ ok: true, fotoUrl });
}
