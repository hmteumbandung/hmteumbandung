import { MEDIA_BUCKET, supabase } from './supabase'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

/** Validasi di sisi klien (UX). Validasi final tetap dipaksa oleh bucket Storage (tipe & ukuran) dan RLS. */
export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Format gambar harus JPG, PNG, atau WebP.'
  if (file.size > MAX_IMAGE_BYTES) return 'Ukuran gambar maksimal 5 MB.'
  return null
}

/** Mengunggah gambar ke bucket "media" dan mengembalikan URL publiknya. Nama file dibuat acak (bukan nama asli). */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const err = validateImage(file)
  if (err) throw new Error(err)
  const path = `${folder}/${crypto.randomUUID()}.${EXT[file.type]}`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}
