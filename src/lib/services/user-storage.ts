import { Storage } from "@google-cloud/storage";

/**
 * GCS exige credenciais de Service Account (JSON com client_email e private_key).
 * GOOGLE_APPLICATION_CREDENTIALS deve apontar para esse JSON, não para o client
 * secret do OAuth (Login com Google), que não contém client_email.
 */
const bucketName = process.env.GCS_BUCKET_NAME;
const storage = bucketName ? new Storage() : null;

const GCS_CREDENTIALS_ERROR =
  "GOOGLE_APPLICATION_CREDENTIALS deve apontar para o JSON de uma Service Account do GCP (IAM → Service Accounts → Chaves). Não use o client secret do OAuth (Login com Google).";

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
      "GCS não configurado: defina GCS_BUCKET_NAME e credenciais (GOOGLE_APPLICATION_CREDENTIALS ou ADC)"
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
