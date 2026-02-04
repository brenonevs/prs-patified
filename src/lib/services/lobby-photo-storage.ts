import { storage, bucketName } from "@/lib/gcs";

const TEMP_PREFIX = "temp/lobby/";
const PROVAS_PREFIX = "provas/";

function getBucket() {
  if (!storage || !bucketName) return null;
  return storage.bucket(bucketName);
}

/**
 * Caminho no GCS a partir da URL pública do Storage.
 * URL: https://storage.googleapis.com/BUCKET/path -> path
 */
function pathFromPublicUrl(url: string): string | null {
  if (!bucketName) return null;
  const base = `https://storage.googleapis.com/${bucketName}/`;
  if (!url.startsWith(base)) return null;
  return url.slice(base.length);
}

/**
 * Verifica se a URL é de foto temporária de lobby.
 */
export function isLobbyTempPhotoUrl(url: string | null): boolean {
  if (!url) return false;
  const path = pathFromPublicUrl(url);
  return path !== null && path.startsWith(TEMP_PREFIX);
}

/**
 * Faz upload da imagem para pasta temporária do lobby.
 * Só persiste em temp; o upload definitivo é ao concluir o lobby.
 */
export async function uploadLobbyPhotoTemp(
  lobbyId: string,
  file: { arrayBuffer: () => Promise<ArrayBuffer>; type: string; name: string }
): Promise<string | null> {
  const bucket = getBucket();
  if (!bucket) return null;

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `${TEMP_PREFIX}${lobbyId}/${Date.now()}.${ext}`;
  const blob = bucket.file(filename);
  const bytes = await file.arrayBuffer();

  await blob.save(Buffer.from(bytes), {
    contentType: file.type.startsWith("image/") ? file.type : "image/png",
    metadata: {
      metadata: { purpose: "lobby_temp" },
    },
  });

  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

/**
 * Copia a foto do temp para o path definitivo (provas/) e remove o temp.
 * Retorna a URL final para usar na partida.
 */
export async function commitLobbyPhotoToProvas(tempPhotoUrl: string): Promise<string | null> {
  const bucket = getBucket();
  if (!bucket) return null;

  const tempPath = pathFromPublicUrl(tempPhotoUrl);
  if (!tempPath || !tempPath.startsWith(TEMP_PREFIX)) return null;

  const tempBlob = bucket.file(tempPath);
  const [contents] = await tempBlob.download();

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = (tempPath.split(".").pop() || "png").toLowerCase();
  const finalFilename = `${PROVAS_PREFIX}${timestamp}-${random}.${ext}`;
  const finalBlob = bucket.file(finalFilename);
  const contentType =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";

  await finalBlob.save(contents, {
    contentType,
    metadata: {
      metadata: { fromLobby: "true" },
    },
  });

  try {
    await tempBlob.delete();
  } catch {
    // best-effort; final is already saved
  }

  return `https://storage.googleapis.com/${bucketName}/${finalFilename}`;
}

/**
 * Remove a foto temporária do lobby (ao cancelar/expirar).
 */
export async function deleteLobbyPhotoTemp(url: string): Promise<void> {
  if (!isLobbyTempPhotoUrl(url)) return;
  const bucket = getBucket();
  if (!bucket) return;

  const path = pathFromPublicUrl(url);
  if (!path) return;

  try {
    await bucket.file(path).delete();
  } catch {
    // ignore
  }
}

export function isGcsConfigured(): boolean {
  return !!(storage && bucketName);
}
