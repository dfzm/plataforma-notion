import { promises as fs } from "fs"
import path from "path"

import type { AppDatabase } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "storage.json")

async function ensureDatabaseFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(DATA_FILE)
  } catch {
    const initialData: AppDatabase = {
      pages: [],
      blocks: [],
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8")
  }
}

export async function loadDatabase(): Promise<AppDatabase> {
  await ensureDatabaseFile()
  const contents = await fs.readFile(DATA_FILE, "utf-8")

  try {
    return JSON.parse(contents) as AppDatabase
  } catch {
    const fallback: AppDatabase = {
      pages: [],
      blocks: [],
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), "utf-8")
    return fallback
  }
}

export async function saveDatabase(database: AppDatabase) {
  await ensureDatabaseFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(database, null, 2), "utf-8")
}


