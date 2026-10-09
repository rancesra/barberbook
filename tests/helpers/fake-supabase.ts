/**
 * Supabase de mentira para las pruebas: anota cada consulta y responde lo
 * que el test decida, sin tocar la base de datos real.
 */

export interface Op {
  table: string
  action: 'select' | 'insert' | 'update' | 'delete'
  values?: Record<string, unknown>
  filters: Record<string, unknown>
  head?: boolean
  count?: string
  order?: { column: string; ascending: boolean }
  range?: [number, number]
}

export interface Result {
  data?: unknown
  error?: { message: string; code?: string } | null
  count?: number | null
}

export interface Upload {
  bucket: string
  name: string
  buffer: Buffer
  contentType: string
}

export function fakeSupabase(handler: (op: Op) => Result | undefined) {
  const calls: Op[] = []
  const uploads: Upload[] = []
  const bucket = { public: true }

  const client = {
    from(table: string) {
      const op: Op = { table, action: 'select', filters: {} }
      const builder = {
        select(_columns?: string, options?: { head?: boolean; count?: string }) {
          if (options?.head) op.head = true
          if (options?.count) op.count = options.count
          return builder
        },
        insert(values: Record<string, unknown>) {
          op.action = 'insert'
          op.values = values
          return builder
        },
        update(values: Record<string, unknown>) {
          op.action = 'update'
          op.values = values
          return builder
        },
        delete() {
          op.action = 'delete'
          return builder
        },
        eq(column: string, value: unknown) {
          op.filters[column] = value
          return builder
        },
        neq(column: string, value: unknown) {
          op.filters[`${column} !=`] = value
          return builder
        },
        gte(column: string, value: unknown) {
          op.filters[`${column} >=`] = value
          return builder
        },
        lt(column: string, value: unknown) {
          op.filters[`${column} <`] = value
          return builder
        },
        order(column: string, options?: { ascending?: boolean }) {
          op.order = { column, ascending: options?.ascending ?? true }
          return builder
        },
        range(from: number, to: number) {
          op.range = [from, to]
          return builder
        },
        limit: () => builder,
        single: () => builder,
        maybeSingle: () => builder,
        then(resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) {
          calls.push(op)
          return Promise.resolve({ data: null, error: null, count: null, ...handler(op) }).then(resolve, reject)
        },
      }
      return builder
    },
    storage: {
      getBucket: async () => ({ data: { public: bucket.public }, error: null }),
      from: (bucketName: string) => ({
        upload: async (name: string, buffer: Buffer, opts: { contentType: string }) => {
          uploads.push({ bucket: bucketName, name, buffer, contentType: opts.contentType })
          return { error: null }
        },
        getPublicUrl: (name: string) => ({
          data: { publicUrl: `https://demo.supabase.co/storage/v1/object/public/${bucketName}/${name}` },
        }),
      }),
    },
  }

  return { client, calls, uploads, bucket }
}

/** Petición HTTP como la que manda el panel. */
export function jsonRequest(method: string, body?: unknown) {
  return new Request('http://localhost/api/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export const params = (id: string) => ({ params: Promise.resolve({ id }) })
