import { ANDROID_PACKAGE_ID } from '../config/appVersion';

// The version currently live on Google Play, read from the public listing
// page. Google changes that page now and then; when neither pattern matches
// this answers null and the app simply does not block anyone.
export async function fetchPlayStoreVersion(): Promise<string | null> {
  const url = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&hl=en&gl=US`;
  const res = await fetch(url, { headers: { 'sec-fetch-site': 'same-origin' } });
  if (!res.ok) {
    return null;
  }
  const text = await res.text();
  const m =
    text.match(/Current Version.+?>([\d.-]+)<\/span>/) ||
    text.match(/\[\[\["([\d.]+?)"\]\]/);
  return m ? m[1].trim() : null;
}
