/**
 * Resolve owned public assets beneath the configured hosting base.
 */
export function publicAssetUrl(assetPath: string): string {
  return `${import.meta.env.BASE_URL}${assetPath.replace(/^\/+/u, "")}`;
}
