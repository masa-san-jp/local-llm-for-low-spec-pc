import { openDB, type IDBPDatabase } from 'idb'
import type { Session } from '../types/chat'

const DB_NAME = 'local-llm'
const DB_VERSION = 1
const STORE = 'sessions'

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    },
  })
}

async function loadSessions(): Promise<Session[]> {
  try {
    const db = await getDb()
    const sessions: Session[] = await db.getAll(STORE)
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

async function saveSession(session: Session): Promise<void> {
  const db = await getDb()
  // Strip image previews before persisting — images are session-only (memory only)
  const sessionToSave: Session = {
    ...session,
    messages: session.messages.map(({ imagePreviews: _, ...msg }) => msg),
  }
  await db.put(STORE, sessionToSave)
}

async function deleteSession(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, id)
}

export { loadSessions, saveSession, deleteSession }
