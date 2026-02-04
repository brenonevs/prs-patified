import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [usersWithCheats, logs] = await Promise.all([
    prisma.user.findMany({
      where: { cheatAttempts: { gt: 0 } },
      select: {
        id: true,
        name: true,
        steamUsername: true,
        email: true,
        cheatAttempts: true,
      },
      orderBy: { cheatAttempts: "desc" },
    }),
    prisma.cheatAttemptLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            steamUsername: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const list = logs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    jogo: log.jogo,
    fotoUrl: log.fotoUrl,
    rankingEnviado: log.rankingEnviado as string[],
    rankingIdentificado: log.rankingIdentificado as string[],
    user: log.user
      ? {
          id: log.user.id,
          name: log.user.name,
          steamUsername: log.user.steamUsername,
          email: log.user.email,
        }
      : null,
    partidaId: log.partidaId,
  }));

  return NextResponse.json({
    users: usersWithCheats.map((u) => ({
      id: u.id,
      name: u.name,
      steamUsername: u.steamUsername,
      email: u.email,
      cheatAttempts: u.cheatAttempts,
    })),
    logs: list,
  });
}
