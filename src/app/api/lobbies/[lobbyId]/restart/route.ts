import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";

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
    include: {
      participants: { where: { leftAt: null }, select: { userId: true } },
    },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Só é possível reiniciar um lobby finalizado." },
      { status: 400 }
    );
  }

  if (lobby.hostId !== session.user.id) {
    return NextResponse.json(
      { error: "Apenas o host pode reiniciar o lobby." },
      { status: 403 }
    );
  }

  // Limpa votos e rankings propostos anteriores
  await prisma.lobbyVote.deleteMany({ where: { lobbyId } });
  await prisma.lobbyProposedRanking.deleteMany({ where: { lobbyId } });

  // Reseta o status do lobby para IN_PROGRESS
  const updatedLobby = await prisma.lobby.update({
    where: { id: lobbyId },
    data: {
      status: "IN_PROGRESS",
      fotoUrl: null,
      votingStartedAt: null,
      votingExpiresAt: null,
      partidaId: null,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 horas
    },
  });

  // Reseta o ready de todos os participantes
  await prisma.lobbyParticipant.updateMany({
    where: { lobbyId, leftAt: null },
    data: { isReady: false },
  });

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "lobby_restarted", {
      lobbyId,
    });
  }

  return NextResponse.json({ ok: true, lobby: updatedLobby });
}
