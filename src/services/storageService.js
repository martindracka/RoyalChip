import { ID } from 'appwrite'
import { storage, BUCKET_ID } from '@/lib/appwrite'

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 MB
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export async function uploadImage(file) {
  const uploaded = await storage.createFile({ bucketId: BUCKET_ID, fileId: ID.unique(), file })
  return uploaded.$id
}

export function getImageUrl(fileId) {
  if (!fileId) return null
  return storage.getFileView({ bucketId: BUCKET_ID, fileId })
}

export async function deleteImage(fileId) {
  if (!fileId) return
  try {
    await storage.deleteFile({ bucketId: BUCKET_ID, fileId })
  } catch (error) {
    if (error.code !== 404) throw error // already gone is fine
  }
}
