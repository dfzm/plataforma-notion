export interface StoredPage {
  id: string
  userId: string
  title: string
  isArchived: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface StoredBlock {
  id: string
  pageId: string
  userId: string
  type: string
  content: string
  position: number
  properties: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AppDatabase {
  pages: StoredPage[]
  blocks: StoredBlock[]
}


