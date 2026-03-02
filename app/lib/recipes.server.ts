export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadImage(
  bucket: R2Bucket,
  file: File,
  prefix: string,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  });
  return key;
}

export async function replaceImage(
  bucket: R2Bucket,
  newFile: File,
  oldKey: string | null,
  prefix: string,
): Promise<string> {
  if (oldKey) await bucket.delete(oldKey);
  return uploadImage(bucket, newFile, prefix);
}
