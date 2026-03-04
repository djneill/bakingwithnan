import type { Route } from "./+types/api.images.$";

/**
 * Serve images from R2 bucket.
 * Route: /api/images/*
 *
 * Supports keys with folder prefixes, e.g. "dishes/abc123.jpg" or
 * "cards/abc123.jpg", which are stored as-is in R2.
 */
export async function loader({ request, params, context }: Route.LoaderArgs) {
  const r2 = context.cloudflare.env.bakingwithnan_images;
  const key = params["*"];

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  // Check Cloudflare edge cache before hitting R2 (avoids Class B operations)
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(request.url, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

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

  const response = new Response(object.body, { headers });

  // Store in Cloudflare edge cache (async, non-blocking)
  context.cloudflare.ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}
