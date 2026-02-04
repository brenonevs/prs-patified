import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
    select: { id: true, code: true, status: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.status !== "WAITING") {
    return NextResponse.json(
      { error: "Ready só é permitido na fase de espera." },
      { status: 400 }
    );
  }

  const participation = await prisma.lobbyParticipant.findUnique({
    where: {
      lobbyId_userId: { lobbyId, userId: session.user.id },
    },
    select: { id: true, isReady: true, leftAt: true },
  });

  if (!participation || participation.leftAt) {
    return NextResponse.json(
      { error: "Você não está neste lobby." },
      { status: 400 }
    );
  }

  const newReady = !participation.isReady;
  await prisma.lobbyParticipant.update({
    where: {
      lobbyId_userId: { lobbyId, userId: session.user.id },
    },
    data: { isReady: newReady },
  });

  if (pusher) {
    await pusher.trigger(getLobbyChannelName(lobby.code), "participant_ready", {
      userId: session.user.id,
      isReady: newReady,
    });
  }

  return NextResponse.json({ ok: true, isReady: newReady });
}
