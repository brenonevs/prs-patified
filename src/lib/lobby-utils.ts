const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Gera um código único de 6 caracteres para o lobby (evita 0/O e 1/I).
 */
export function generateLobbyCode(): string {
  let code = "";
  const random = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(random);
  } else {
    for (let i = 0; i < 6; i++) random[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[random[i] % CODE_CHARS.length];
  }
  return code;
}

/**
 * Normaliza código para comparação (uppercase, sem espaços).
 */
export function normalizeLobbyCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s/g, "");
}

/**
 * Valida formato do código (6 caracteres alfanuméricos).
 */
export function isValidLobbyCodeFormat(code: string): boolean {
  const normalized = normalizeLobbyCode(code);
  return /^[A-Z0-9]{6}$/.test(normalized);
}

const LOBBY_WAITING_EXPIRY_MINUTES = 60;
const VOTING_EXPIRY_MINUTES = 30;

export function getLobbyExpiresAt(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + LOBBY_WAITING_EXPIRY_MINUTES);
  return d;
}

export function getVotingExpiresAt(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + VOTING_EXPIRY_MINUTES);
  return d;
}

export const MIN_PLAYERS_TO_START = 2;
export const MAX_REJECTIONS_BEFORE_CANCEL = 5;
