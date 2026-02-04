import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";
import {
  isLobbyTempPhotoUrl,
  deleteLobbyPhotoTemp,
} from "@/lib/services/lobby-photo-storage";

export const dynamic = "force-dynamic";

const lobbyInclude = {
  host: { select: { id: true, name: true, image: true, steamUsername: true } },
  participants: {
    where: { leftAt: null },
    include: {
      user: {
        select: { id: true, name: true, image: true, steamUsername: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  },
  proposedRanking: {
    include: { proposedBy: { select: { id: true, name: true } } },
  },
  votes: true,
} as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lobbyId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { lobbyId } = await params;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: lobbyInclude,
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  const isParticipant = lobby.participants.some(
    (p: { userId: string }) => p.userId === session.user.id
  );
  if (!isParticipant) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return NextResponse.json({
    ...lobby,
    currentUserId: session.user.id,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ lobbyId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { lobbyId } = await params;
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    select: { id: true, code: true, hostId: true, status: true, fotoUrl: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.hostId !== session.user.id) {
    return NextResponse.json(
      { error: "Apenas o host pode cancelar o lobby." },
      { status: 403 }
    );
  }

  if (["COMPLETED", "CANCELLED", "EXPIRED"].includes(lobby.status)) {
    return NextResponse.json(
      { error: "Lobby já finalizado." },
      { status: 400 }
    );
  }

  await prisma.lobby.update({
    where: { id: lobbyId },
    data: { status: "CANCELLED" },
  });

  if (lobby.fotoUrl && isLobbyTempPhotoUrl(lobby.fotoUrl)) {
    await deleteLobbyPhotoTemp(lobby.fotoUrl);
  }

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "lobby_cancelled", {
      reason: "cancelado_pelo_host",
    });
  }

  return NextResponse.json({ ok: true });
}
