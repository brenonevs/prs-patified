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
    select: { id: true, steamUsername: true },
    orderBy: { steamUsername: "asc" },
  });

  type UserRow = { id: string; steamUsername: string | null };
  return NextResponse.json(
    users
      .filter((u: UserRow) => u.steamUsername)
      .map((u: UserRow) => ({ id: u.id, name: u.steamUsername }))
  );
}
