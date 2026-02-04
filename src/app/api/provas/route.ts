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

  const partidas = await prisma.partida.findMany({
    where: {
      fotoUrl: { not: null },
    },
    select: {
      id: true,
      jogo: true,
      fotoUrl: true,
      createdAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          steamUsername: true,
          image: true,
        },
      },
      podium: {
        orderBy: { posicao: "asc" },
        select: {
          posicao: true,
          playerName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const provas = partidas
    .filter((p) => p.fotoUrl)
    .map((p) => ({
      id: p.id,
      url: p.fotoUrl,
      jogo: p.jogo,
      createdAt: p.createdAt.toISOString(),
      uploadedBy: {
        id: p.createdBy.id,
        name: p.createdBy.steamUsername ?? p.createdBy.name,
        avatar: p.createdBy.image,
      },
      podium: p.podium.map((pod) => ({
        posicao: pod.posicao,
        nome: pod.playerName,
      })),
    }));

  return NextResponse.json(provas);
}
