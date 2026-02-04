import { Storage, type StorageOptions } from "@google-cloud/storage";

const bucketName = process.env.GCS_BUCKET_NAME ?? null;

/**
 * Credenciais do GCS podem vir de:
 * - GCS_SERVICE_ACCOUNT_JSON: JSON da Service Account em uma única string (recomendado na Vercel; evita pasta secrets no repo).
 * - GOOGLE_APPLICATION_CREDENTIALS: caminho para o arquivo JSON (desenvolvimento local com pasta secrets/).
 */
function getStorageOptions(): StorageOptions | undefined {
  const json = process.env.GCS_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const credentials = JSON.parse(json) as {
        client_email?: string;
        private_key?: string;
      };
      if (credentials.client_email && credentials.private_key) {
        const privateKey = credentials.private_key.replace(/\\n/g, "\n");
        return { credentials: { ...credentials, private_key: privateKey } };
      }
    } catch {
      /* ignore parse error */
    }
  }
  return undefined;
}

const storageOptions = getStorageOptions();
const storage: Storage | null =
  bucketName !== null
    ? storageOptions
      ? new Storage(storageOptions)
      : new Storage()
    : null;

export { storage, bucketName };
