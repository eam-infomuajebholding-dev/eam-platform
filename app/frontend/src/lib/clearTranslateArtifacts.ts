/** Remove Google Translate leftovers that break React SPAs (blank page). */
export function clearTranslateArtifacts() {
  if (typeof document === 'undefined') {
    return;
  }

  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `googtrans=;expires=${expired};path=/`;

  document.documentElement.classList.remove('translated-ltr', 'translated-rtl');
  document.body?.classList.remove('translated-ltr', 'translated-rtl');
  document.body?.style.removeProperty('top');
  document.body?.style.removeProperty('position');

  document.querySelectorAll('script[data-eam-google-translate]').forEach((node) => node.remove());
  document.querySelectorAll('script[src*="translate.google.com"]').forEach((node) => node.remove());
  document.querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame').forEach((node) => node.remove());
  document.getElementById('google_translate_element')?.replaceChildren();

  const root = document.getElementById('root');
  if (root) {
    root.style.removeProperty('display');
    root.style.removeProperty('visibility');
  }
}
