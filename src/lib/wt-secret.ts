
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET doit être définie et contenir au moins 32 caractères.'
    );
  }

  return secret;
}
