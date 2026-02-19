import { openDB } from 'idb'

const DB_NAME = 'gym-tracker-db'
const DB_VERSION = 1

let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv')
      }
    }
  })
  return _db
}

export async function dbGet(key) {
  try {
    return (await getDB()).get('kv', key)
  } catch {
    return null
  }
}

export async function dbSet(key, value) {
  try {
    return (await getDB()).put('kv', value, key)
  } catch {
    // Fallback to localStorage
    localStorage.setItem(key, JSON.stringify(value))
  }
}
