import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Storage } from "@google-cloud/storage";
import { auth } from "@/lib/auth";

const bucketName = process.env.GCS_BUCKET_NAME;
const storage = bucketName ? new Storage() : null;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!storage || !bucketName) {
    return NextResponse.json(
      { error: "GCS não configurado. Defina GCS_BUCKET_NAME e GOOGLE_APPLICATION_CREDENTIALS." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Envie uma imagem válida" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop() || "png";
  const filename = `provas/${timestamp}-${random}.${ext}`;

  try {
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);
    const bytes = await file.arrayBuffer();

    await blob.save(Buffer.from(bytes), {
      contentType: file.type,
      metadata: {
        metadata: {
          uploadedBy: session.user.id,
        },
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Erro ao fazer upload para GCS:", err);
    return NextResponse.json(
      { error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}
