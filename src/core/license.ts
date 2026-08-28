export const PRODUCT_SLUG = 'bookmark-freshness-review';
export const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/checkout`;

export interface LicenseCache { token: string; valid: boolean; checkedAt: number; }

export async function verifyLicense(token: string): Promise<boolean> {
  const url = `https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('License check could not connect.');
  const data = await response.json() as { valid?: boolean };
  return data.valid === true;
}
