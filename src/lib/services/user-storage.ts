import { storage, bucketName } from "@/lib/gcs";

const GCS_CREDENTIALS_ERROR =
  "Defina credenciais de Service Account: GCS_SERVICE_ACCOUNT_JSON (JSON em string) ou GOOGLE_APPLICATION_CREDENTIALS (caminho do arquivo). Use IAM → Service Accounts → Chaves no GCP.";

/**
 * Prefixo no bucket onde ficam as pastas por usuário.
 * Objetos do usuário devem usar: getUserFolderPrefix(userId) + filename
 */
const USER_PREFIX = "users";

/**
 * Retorna o prefixo (path) da pasta do usuário no bucket.
 * Use este valor como prefixo em uploads/listagens para isolar arquivos por usuário.
 *
 * @param userId - ID único do usuário (Better Auth)
 * @returns Prefixo no formato "users/{userId}/"
 */
export function getUserFolderPrefix(userId: string): string {
  return `${USER_PREFIX}/${userId}/`;
}

/**
 * Cria a pasta dedicada do usuário no GCS.
 * No GCS tradicional não existem pastas; criamos um objeto placeholder para que
 * o prefixo exista e apareça em listagens. Operação idempotente.
 *
 * @param userId - ID único do usuário
 * @throws Se GCS_BUCKET_NAME não estiver definido ou falha na escrita
 */
export async function createUserFolder(userId: string): Promise<void> {
  if (!storage || !bucketName) {
    throw new Error(
      "GCS não configurado: defina GCS_BUCKET_NAME e credenciais (GCS_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS)"
    );
  }

  const bucket = storage.bucket(bucketName);
  const placeholderName = `${getUserFolderPrefix(userId)}.folder`;

  try {
    await bucket.file(placeholderName).save("", {
      contentType: "application/octet-stream",
      metadata: {
        metadata: {
          purpose: "user-folder-placeholder",
          userId,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("client_email")) {
      throw new Error(GCS_CREDENTIALS_ERROR);
    }
    throw err;
  }
}
