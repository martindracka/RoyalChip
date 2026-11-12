import { ID, Query } from 'appwrite'
import { TABLES } from '@/lib/appwrite'
import { listRows, getRow, createRow, updateRow, deleteRow } from './db'
import { uploadImage, deleteImage } from './storageService'

const T = TABLES.games

export async function listGames({ onlyActive = false, type = '', search = '' } = {}) {
  const queries = [Query.orderAsc('name'), Query.limit(100)]
  if (onlyActive) queries.push(Query.equal('isActive', true))
  if (type) queries.push(Query.equal('type', type))
  if (search) queries.push(Query.search('name', search))
  const { rows } = await listRows(T, queries)
  return rows
}

export function getGame(id) {
  return getRow(T, id)
}

// Table permissions (not row permissions) decide who may write games,
// so we don't pass any row-level permissions here.
export async function createGame(data, imageFile) {
  const imageId = imageFile ? await uploadImage(imageFile) : null
  try {
    return await createRow(T, ID.unique(), { ...data, imageId })
  } catch (error) {
    await deleteImage(imageId) // don't leave an unused file in Storage
    throw error
  }
}

// The old image is deleted only after the row points to the new one,
// so a failed save never leaves the game with a missing image.
export async function updateGame(game, data, imageFile) {
  if (!imageFile) return updateRow(T, game.$id, data)
  const imageId = await uploadImage(imageFile)
  let updated
  try {
    updated = await updateRow(T, game.$id, { ...data, imageId })
  } catch (error) {
    await deleteImage(imageId)
    throw error
  }
  await deleteImage(game.imageId)
  return updated
}

export async function deleteGame(game) {
  await deleteRow(T, game.$id)
  await deleteImage(game.imageId)
}
