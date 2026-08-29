export const PRODUCT_SLUG = 'bookmark-freshness-review';
export const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
export const DEMO_LICENSE_KEY = `demo:${LICENSE_KEY}`;

export interface LicenseCache { token: string; valid: boolean; checkedAt: number; verified: true; }

export function hasVerifiedLicense(cache: LicenseCache | null | undefined): boolean {
  return cache?.valid === true && cache.verified === true;
}

export function verifiedLicense(token: string, valid: boolean): LicenseCache {
  return { token, valid, checkedAt: Date.now(), verified: true };
}

export async function verifyLicense(token: string): Promise<boolean> {
  const url = `https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('License check could not connect.');
  const data = await response.json() as { valid?: boolean };
  return data.valid === true;
}
