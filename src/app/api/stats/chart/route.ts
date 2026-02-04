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

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const podiumResults = await prisma.partidaPodium.findMany({
    where: {
      userId,
      partida: {
        createdAt: { gte: ninetyDaysAgo },
      },
    },
    include: {
      partida: {
        select: { createdAt: true },
      },
    },
    orderBy: { partida: { createdAt: "asc" } },
  });

  const dataByDate = new Map<string, { fuiPatificado: number; patifiquei: number }>();

  for (const result of podiumResults) {
    const dateStr = result.partida.createdAt.toISOString().slice(0, 10);
    const current = dataByDate.get(dateStr) || { fuiPatificado: 0, patifiquei: 0 };

    if (result.posicao === 1) {
      current.patifiquei++;
    } else {
      current.fuiPatificado++;
    }

    dataByDate.set(dateStr, current);
  }

  const chartData = Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(chartData);
}
