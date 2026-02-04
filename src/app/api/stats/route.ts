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

  const userId = session.user.id;

  const podiumResults = await prisma.partidaPodium.findMany({
    where: { userId },
    include: { partida: { select: { createdAt: true } } },
    orderBy: { partida: { createdAt: "desc" } },
  });

  const vezesPatificou = podiumResults.filter((p) => p.posicao === 1).length;
  const vezesPatificado = podiumResults.filter((p) => p.posicao >= 2).length;
  const totalPartidas = podiumResults.length;

  let sequenciaAtual = 0;
  for (const p of podiumResults) {
    if (p.posicao === 1) sequenciaAtual++;
    else break;
  }

  return NextResponse.json({
    vezesPatificado,
    vezesPatificou,
    totalPartidas,
    sequenciaAtual,
  });
}
