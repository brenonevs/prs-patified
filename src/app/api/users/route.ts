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

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    users.map((u) => ({ id: u.id, name: u.name || "Sem nome" }))
  );
}
