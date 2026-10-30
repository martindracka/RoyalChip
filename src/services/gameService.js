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
  return createRow(T, ID.unique(), { ...data, imageId })
}

export async function updateGame(game, data, imageFile) {
  let imageId = game.imageId
  if (imageFile) {
    imageId = await uploadImage(imageFile)
    await deleteImage(game.imageId)
  }
  return updateRow(T, game.$id, { ...data, imageId })
}

export async function deleteGame(game) {
  await deleteRow(T, game.$id)
  await deleteImage(game.imageId)
}
