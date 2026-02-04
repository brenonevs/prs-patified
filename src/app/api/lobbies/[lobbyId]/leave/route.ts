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

export async function POST(
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
    select: {
      id: true,
      code: true,
      hostId: true,
      status: true,
      fotoUrl: true,
      participants: {
        where: { leftAt: null },
        select: { userId: true },
      },
    },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  const participation = await prisma.lobbyParticipant.findUnique({
    where: {
      lobbyId_userId: { lobbyId, userId: session.user.id },
    },
    select: { id: true, leftAt: true },
  });

  if (!participation || participation.leftAt) {
    return NextResponse.json(
      { error: "Você não está neste lobby." },
      { status: 400 }
    );
  }

  if (["COMPLETED", "CANCELLED", "EXPIRED"].includes(lobby.status)) {
    return NextResponse.json(
      { error: "Lobby já finalizado." },
      { status: 400 }
    );
  }

  await prisma.lobbyParticipant.update({
    where: {
      lobbyId_userId: { lobbyId, userId: session.user.id },
    },
    data: { leftAt: new Date() },
  });

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "participant_left", {
      userId: session.user.id,
    });
  }

  const isHostLeaving = lobby.hostId === session.user.id;
  const remaining = lobby.participants.filter(
    (p: { userId: string }) => p.userId !== session.user.id
  );

  if (isHostLeaving && remaining.length > 0) {
    const newHostId = remaining[0].userId;
    await prisma.lobby.update({
      where: { id: lobbyId },
      data: { hostId: newHostId },
    });
    if (pusher) {
      await pusher.trigger(getLobbyChannelName(lobby.code), "host_changed", {
        newHostId,
      });
    }
  } else if (isHostLeaving && remaining.length === 0) {
    await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: "CANCELLED" },
    });
    if (lobby.fotoUrl && isLobbyTempPhotoUrl(lobby.fotoUrl)) {
      await deleteLobbyPhotoTemp(lobby.fotoUrl);
    }
    if (pusher) {
      await pusher.trigger(getLobbyChannelName(lobby.code), "lobby_cancelled", {
        reason: "host_saiu",
      });
    }
  }

  return NextResponse.json({ ok: true });
}
