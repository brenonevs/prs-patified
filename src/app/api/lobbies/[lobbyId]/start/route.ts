import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MIN_PLAYERS_TO_START } from "@/lib/lobby-utils";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";

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
      _count: { select: { participants: { where: { leftAt: null } } } },
    },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.hostId !== session.user.id) {
    return NextResponse.json(
      { error: "Apenas o host pode iniciar a partida." },
      { status: 403 }
    );
  }

  if (lobby.status !== "WAITING") {
    return NextResponse.json(
      { error: "Partida já iniciada ou lobby finalizado." },
      { status: 400 }
    );
  }

  if (lobby._count.participants < MIN_PLAYERS_TO_START) {
    return NextResponse.json(
      { error: `Mínimo de ${MIN_PLAYERS_TO_START} jogadores para iniciar.` },
      { status: 400 }
    );
  }

  await prisma.lobby.update({
    where: { id: lobbyId },
    data: { status: "IN_PROGRESS" },
  });

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "lobby_started", {});
  }

  return NextResponse.json({ ok: true });
}
