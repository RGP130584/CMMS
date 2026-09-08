/**
 * Utilitários de segurança e criptografia client-side
 */

export async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha + '_cmms_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
