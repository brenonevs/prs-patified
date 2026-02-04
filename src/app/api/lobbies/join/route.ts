import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeLobbyCode, isValidLobbyCodeFormat } from "@/lib/lobby-utils";
import { pusher, getLobbyChannelName } from "@/lib/pusher-server";
import {
  isLobbyTempPhotoUrl,
  deleteLobbyPhotoTemp,
} from "@/lib/services/lobby-photo-storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const codeRaw = typeof body.code === "string" ? body.code : "";
  const code = normalizeLobbyCode(codeRaw);

  if (!isValidLobbyCodeFormat(code)) {
    return NextResponse.json(
      { error: "Código inválido. Use 6 caracteres." },
      { status: 400 }
    );
  }

  const lobby = await prisma.lobby.findUnique({
    where: { code },
    include: {
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
    },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  if (lobby.status !== "WAITING") {
    return NextResponse.json(
      { error: "Este lobby não está aceitando entradas." },
      { status: 400 }
    );
  }

  if (new Date() > lobby.expiresAt) {
    await prisma.lobby.update({
      where: { id: lobby.id },
      data: { status: "EXPIRED" },
    });
    if (lobby.fotoUrl && isLobbyTempPhotoUrl(lobby.fotoUrl)) {
      await deleteLobbyPhotoTemp(lobby.fotoUrl);
    }
    return NextResponse.json(
      { error: "Este lobby expirou." },
      { status: 400 }
    );
  }

  const existing = await prisma.lobbyParticipant.findUnique({
    where: {
      lobbyId_userId: { lobbyId: lobby.id, userId: session.user.id },
    },
    select: { leftAt: true },
  });

  if (existing && !existing.leftAt) {
    return NextResponse.json(
      { error: "Você já está neste lobby." },
      { status: 400 }
    );
  }

  if (existing) {
    await prisma.lobbyParticipant.update({
      where: {
        lobbyId_userId: { lobbyId: lobby.id, userId: session.user.id },
      },
      data: { leftAt: null, isReady: false },
    });
  } else {
    await prisma.lobbyParticipant.create({
      data: {
        lobbyId: lobby.id,
        userId: session.user.id,
      },
    });
  }

  const updated = await prisma.lobby.findUnique({
    where: { id: lobby.id },
    include: {
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
    },
  });

  const userPayload = {
    id: session.user.id,
    name: session.user.name ?? "Usuário",
    image: (session.user as { image?: string | null }).image ?? null,
    steamUsername: (updated?.participants.find((p) => p.userId === session.user.id)?.user as { steamUsername?: string | null })?.steamUsername ?? null,
  };

  if (pusher && updated) {
    await pusher.trigger(
      getLobbyChannelName(updated.code),
      "participant_joined",
      { user: userPayload }
    );
  }

  return NextResponse.json(updated);
}
