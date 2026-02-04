import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Retorna todas as partidas da plataforma que possuem foto de comprovação,
 * para exibição na Biblioteca de Patificadas (acesso apenas autenticado).
 */
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
    },
    orderBy: { createdAt: "desc" },
  });

  const items = partidas.map((p) => ({
    id: p.id,
    jogo: p.jogo,
    fotoUrl: p.fotoUrl,
    data: p.createdAt.toISOString().slice(0, 10),
  }));

  return NextResponse.json(items);
}
