import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads");
const OUTPUTS_DIR = join(process.cwd(), "outputs");

/**
 * Garante que o diretório de uploads existe.
 */
async function ensureUploadsDir(): Promise<void> {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Gera um nome único para o arquivo baseado em timestamp e string aleatória.
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "png";
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Salva o arquivo de imagem no diretório de uploads.
 *
 * @param file - Arquivo de imagem recebido do FormData
 * @returns Caminho absoluto do arquivo salvo
 */
export async function saveUploadedFile(file: File): Promise<string> {
  await ensureUploadsDir();

  const filename = generateUniqueFilename(file.name);
  const filepath = join(UPLOADS_DIR, filename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filepath, buffer);

  return filepath;
}

/**
 * Retorna o diretório de uploads.
 */
export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

/**
 * Garante que o diretório de outputs existe.
 */
async function ensureOutputsDir(): Promise<void> {
  if (!existsSync(OUTPUTS_DIR)) {
    await mkdir(OUTPUTS_DIR, { recursive: true });
  }
}

/**
 * Retorna o diretório onde os modelos 3D gerados são salvos.
 */
export function getOutputsDir(): string {
  return OUTPUTS_DIR;
}

/**
 * Baixa um arquivo de uma URL e salva em destPath.
 *
 * @param url - URL pública do arquivo
 * @param destPath - Caminho absoluto do arquivo de destino
 */
export async function downloadToFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await ensureOutputsDir();
  await writeFile(destPath, buffer);
}

/**
 * Gera um nome único para um arquivo de modelo 3D (.glb).
 */
export function generateOutputModelFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.glb`;
}
