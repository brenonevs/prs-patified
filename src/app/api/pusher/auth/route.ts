import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Pusher from "pusher";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLobbyChannelName } from "@/lib/pusher-server";

export const dynamic = "force-dynamic";

const pusher =
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_SECRET &&
  process.env.NEXT_PUBLIC_PUSHER_KEY &&
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ? new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      })
    : null;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!pusher) {
    return NextResponse.json(
      { error: "Pusher não configurado" },
      { status: 503 }
    );
  }

  let socket_id: string | null = null;
  let channel_name: string | null = null;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    socket_id = params.get("socket_id");
    channel_name = params.get("channel_name");
  } else {
    const body = await request.formData();
    socket_id = body.get("socket_id") as string | null;
    channel_name = body.get("channel_name") as string | null;
  }

  if (!socket_id || !channel_name || !channel_name.startsWith("private-lobby-")) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const code = channel_name.replace("private-lobby-", "").toUpperCase();
  const lobby = await prisma.lobby.findUnique({
    where: { code },
    select: { id: true, status: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  const participation = await prisma.lobbyParticipant.findUnique({
    where: {
      lobbyId_userId: { lobbyId: lobby.id, userId: session.user.id },
    },
    select: { leftAt: true },
  });

  const isParticipant =
    participation && !participation.leftAt &&
    !["CANCELLED", "EXPIRED"].includes(lobby.status);

  if (!isParticipant) {
    return NextResponse.json({ error: "Acesso negado ao canal" }, { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: session.user.id,
    user_info: {
      name: session.user.name ?? "",
    },
  });

  return NextResponse.json(authResponse);
}
