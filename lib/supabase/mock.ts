import type { User } from "@supabase/supabase-js"

type TableName = "pages" | "blocks"

interface MockUser extends Pick<User, "id" | "email" | "user_metadata"> {
  email_confirmed_at: string | null
}

interface MockPage {
  id: string
  user_id: string
  title: string
  updated_at: string
  created_at: string
}

interface MockBlock {
  id: string
  page_id: string
  user_id: string
  type: string
  content: string
  position: number
  properties?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface MockDatabase {
  users: MockUser[]
  pages: MockPage[]
  blocks: MockBlock[]
}

interface PostgrestResponse<T> {
  data: T
  error: null
}

type FilterFn<T> = (row: T) => boolean

const INITIAL_DATA: MockDatabase = {
  users: [
    {
      id: "demo-user-id",
      email: "demo@notion.com",
      user_metadata: {
        display_name: "Usuario demo",
      },
      email_confirmed_at: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    },
  ],
  pages: [
    {
      id: "demo-page-1",
      user_id: "demo-user-id",
      title: "Bienvenido a la demo",
      created_at: new Date("2024-01-05T10:30:00.000Z").toISOString(),
      updated_at: new Date("2024-01-10T16:45:00.000Z").toISOString(),
    },
    {
      id: "demo-page-2",
      user_id: "demo-user-id",
      title: "Guía rápida",
      created_at: new Date("2024-02-02T12:00:00.000Z").toISOString(),
      updated_at: new Date("2024-02-10T08:15:00.000Z").toISOString(),
    },
  ],
  blocks: [
    {
      id: "demo-block-1",
      page_id: "demo-page-1",
      user_id: "demo-user-id",
      type: "heading1",
      content: "¡Hola! 👋",
      position: 0,
      properties: {},
      created_at: new Date("2024-01-05T10:30:00.000Z").toISOString(),
      updated_at: new Date("2024-01-10T16:45:00.000Z").toISOString(),
    },
    {
      id: "demo-block-2",
      page_id: "demo-page-1",
      user_id: "demo-user-id",
      type: "paragraph",
      content:
        "Esta es una versión de demostración que funciona sin conexión a Supabase. Puedes crear y modificar bloques para ver la experiencia completa.",
      position: 1,
      properties: {},
      created_at: new Date("2024-01-05T10:30:00.000Z").toISOString(),
      updated_at: new Date("2024-01-10T16:45:00.000Z").toISOString(),
    },
    {
      id: "demo-block-3",
      page_id: "demo-page-2",
      user_id: "demo-user-id",
      type: "heading2",
      content: "Siguientes pasos",
      position: 0,
      properties: {},
      created_at: new Date("2024-02-02T12:00:00.000Z").toISOString(),
      updated_at: new Date("2024-02-10T08:15:00.000Z").toISOString(),
    },
    {
      id: "demo-block-4",
      page_id: "demo-page-2",
      user_id: "demo-user-id",
      type: "todo",
      content: "Configura tus variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY",
      position: 1,
      properties: { checked: false },
      created_at: new Date("2024-02-02T12:00:00.000Z").toISOString(),
      updated_at: new Date("2024-02-10T08:15:00.000Z").toISOString(),
    },
  ],
}

declare global {
  // eslint-disable-next-line no-var
  var __MOCK_SUPABASE_DB__: MockDatabase | undefined
}

function getDatabase(): MockDatabase {
  if (!globalThis.__MOCK_SUPABASE_DB__) {
    globalThis.__MOCK_SUPABASE_DB__ = structuredClone(INITIAL_DATA)
  }
  return globalThis.__MOCK_SUPABASE_DB__
}

function structuredClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildResponse<T>(data: T): PostgrestResponse<T> {
  return { data, error: null }
}

function applyFilters<T>(rows: T[], filters: FilterFn<T>[]) {
  if (filters.length === 0) return rows
  return rows.filter((row) => filters.every((fn) => fn(row)))
}

function createSelectBuilder<T extends MockPage | MockBlock>(options: {
  table: TableName
  rows: T[]
  filters: FilterFn<T>[]
}) {
  const { table } = options
  let rows = options.rows
  const filters = [...options.filters]

  const builder = {
    select() {
      return builder
    },
    eq(column: keyof T, value: unknown) {
      filters.push((row) => row[column] === value)
      return builder
    },
    order(column: keyof T, opts?: { ascending?: boolean }) {
      const ascending = opts?.ascending ?? true
      rows = [...applyFilters(rows, filters)].sort((a, b) => {
        const av = a[column]
        const bv = b[column]
        if (av === bv) return 0
        return ascending ? ((av as number | string) > (bv as number | string) ? 1 : -1) : ((av as number | string) < (bv as number | string) ? 1 : -1)
      })
      return builder
    },
    limit(count: number) {
      rows = applyFilters(rows, filters).slice(0, count)
      return builder
    },
    single() {
      const filtered = applyFilters(rows, filters)
      return Promise.resolve(buildResponse(filtered[0] ?? null))
    },
    then<TResult1 = PostgrestResponse<T[]>, TResult2 = never>(
      onfulfilled?: ((value: PostgrestResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ) {
      const filtered = applyFilters(rows, filters)
      const payload = buildResponse(structuredClone(filtered))
      return Promise.resolve(payload).then(onfulfilled, onrejected)
    },
  }

  // Preserve table name so insert/select combos can inspect it if needed
  Object.defineProperty(builder, "__table", {
    value: table,
    enumerable: false,
  })

  return builder
}

function createInsertBuilder<T extends MockPage | MockBlock>(table: TableName, payload: T | T[]) {
  const db = getDatabase()
  const records = Array.isArray(payload) ? payload : [payload]
  const now = new Date().toISOString()

  const withDefaults = records.map((record) => {
    const base = { ...record }
    if (!("id" in base) || !base.id) {
      base.id = crypto.randomUUID() as never
    }

    if (table === "pages") {
      ;(base as unknown as MockPage).created_at ||= now
      ;(base as unknown as MockPage).updated_at ||= now
    }

    if (table === "blocks") {
      ;(base as unknown as MockBlock).created_at ||= now
      ;(base as unknown as MockBlock).updated_at ||= now
    }

    return base
  }) as T[]

  // Persist
  const target = db[table]
  withDefaults.forEach((record) => {
    target.push(structuredClone(record))
  })

  const builder = {
    select() {
      return createSelectBuilder({
        table,
        rows: withDefaults,
        filters: [],
      })
    },
    single() {
      return Promise.resolve(buildResponse(structuredClone(withDefaults[0] ?? null)))
    },
    then<TResult1 = PostgrestResponse<T[]>, TResult2 = never>(
      onfulfilled?: ((value: PostgrestResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ) {
      return Promise.resolve(buildResponse(structuredClone(withDefaults))).then(onfulfilled, onrejected)
    },
  }

  return builder
}

function createUpdateBuilder<T extends MockPage | MockBlock>(table: TableName, payload: Partial<T>) {
  const db = getDatabase()
  const filters: FilterFn<T>[] = []

  const builder = {
    eq(column: keyof T, value: unknown) {
      filters.push((row) => row[column] === value)
      return builder
    },
    then<TResult1 = PostgrestResponse<T[]>, TResult2 = never>(
      onfulfilled?: ((value: PostgrestResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ) {
      const target = db[table] as T[]
      const matching = target.filter((row) => filters.every((fn) => fn(row)))
      const updated = matching.map((row) => {
        Object.assign(row, payload)
        return structuredClone(row)
      })
      return Promise.resolve(buildResponse(updated)).then(onfulfilled, onrejected)
    },
  }

  return builder
}

function createDeleteBuilder<T extends MockPage | MockBlock>(table: TableName) {
  const db = getDatabase()
  const filters: FilterFn<T>[] = []

  const builder = {
    eq(column: keyof T, value: unknown) {
      filters.push((row) => row[column] === value)
      return builder
    },
    then<TResult1 = PostgrestResponse<T[]>, TResult2 = never>(
      onfulfilled?: ((value: PostgrestResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ) {
      const target = db[table] as T[]
      const remaining: T[] = []
      const removed: T[] = []

      target.forEach((row) => {
        if (filters.length === 0 || filters.every((fn) => fn(row))) {
          removed.push(structuredClone(row))
        } else {
          remaining.push(row)
        }
      })

      db[table] = remaining as typeof db[typeof table]

      return Promise.resolve(buildResponse(removed)).then(onfulfilled, onrejected)
    },
  }

  return builder
}

export interface MockSupabaseClient {
  auth: {
    getUser: () => Promise<PostgrestResponse<{ user: User | null }>>
    signInWithPassword: (args: { email: string; password: string }) => Promise<{ data: { user: User | null }; error: Error | null }>
    signUp: (args: {
      email: string
      password: string
      options?: {
        emailRedirectTo?: string
        data?: Record<string, unknown>
      }
    }) => Promise<{ data: { user: User | null }; error: Error | null }>
    signOut: () => Promise<{ error: null }>
  }
  from: (table: TableName) => {
    select: () => ReturnType<typeof createSelectBuilder<MockPage | MockBlock>>
    insert: (payload: MockPage | MockBlock | Array<MockPage | MockBlock>) => ReturnType<typeof createInsertBuilder<MockPage | MockBlock>>
    update: (payload: Partial<MockPage> | Partial<MockBlock>) => ReturnType<typeof createUpdateBuilder<MockPage | MockBlock>>
    delete: () => ReturnType<typeof createDeleteBuilder<MockPage | MockBlock>>
  }
}

function normalizeEnvValue(value: string | undefined) {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "undefined" || trimmed === "null") {
    return ""
  }
  return trimmed
}

export function resolveSupabaseCredentials() {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!url || !key) {
    return null
  }

  return { url, key }
}

export function hasSupabaseCredentials() {
  return Boolean(resolveSupabaseCredentials())
}

export function createMockSupabaseClient(): MockSupabaseClient {
  const db = getDatabase()

  const auth = {
    async getUser() {
      const storedUser = db.users[0] ?? null
      return buildResponse({ user: structuredClone(storedUser) as User | null })
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      const existing = db.users.find((user) => user.email === email) ?? null
      if (!existing) {
        return { data: { user: null }, error: new Error("Usuario no encontrado en modo demo") }
      }
      return { data: { user: structuredClone(existing) as User }, error: null }
    },
    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
      const existing = db.users.find((user) => user.email === email)
      if (existing) {
        return { data: { user: structuredClone(existing) as User }, error: null }
      }

      const newUser: MockUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: {
          display_name: options?.data?.display_name ?? email.split("@")[0],
        },
        email_confirmed_at: new Date().toISOString(),
      }

      db.users.push(newUser)
      return { data: { user: structuredClone(newUser) as User }, error: null }
    },
    async signOut() {
      return { error: null }
    },
  }

  return {
    auth,
    from(table: TableName) {
      const dataset = table === "pages" ? (db.pages as Array<MockPage | MockBlock>) : (db.blocks as Array<MockPage | MockBlock>)
      return {
        select() {
          return createSelectBuilder({
            table,
            rows: structuredClone(dataset) as MockPage[] | MockBlock[],
            filters: [],
          })
        },
        insert(payload: MockPage | MockBlock | Array<MockPage | MockBlock>) {
          return createInsertBuilder(table, payload as MockPage | MockBlock | Array<MockPage | MockBlock>)
        },
        update(payload: Partial<MockPage> | Partial<MockBlock>) {
          return createUpdateBuilder(table, payload as Partial<MockPage> | Partial<MockBlock>)
        },
        delete() {
          return createDeleteBuilder(table)
        },
      }
    },
  }
}


