import type { Route } from "./+types/api.images.$";

/**
 * Serve images from R2 bucket.
 * Route: /api/images/*
 *
 * Supports keys with folder prefixes, e.g. "dishes/abc123.jpg" or
 * "cards/abc123.jpg", which are stored as-is in R2.
 */
export async function loader({ params, context }: Route.LoaderArgs) {
  const r2 = context.cloudflare.env.bakingwithnan_images;
  const key = params["*"];

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  const object = await r2.get(key);

  if (!object) {
    return new Response("Image not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);

  // Fallback content type
  if (!headers.get("content-type")) {
    const ext = key.split(".").pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      avif: "image/avif",
    };
    headers.set(
      "content-type",
      typeMap[ext ?? ""] ?? "application/octet-stream",
    );
  }

  // Cache for 1 year (images are immutable — keyed by content hash)
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
