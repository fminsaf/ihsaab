type PageResult<T> = { data: T[] | null; error: { message: string } | null }

/** Fetch every row from a Supabase query without relying on the server's row cap. */
export async function fetchAllRows<T>(fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>, pageSize = 1000) {
  const rows: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1)
    if (error) return { data: rows, error }
    const page = data ?? []
    rows.push(...page)
    if (page.length < pageSize) return { data: rows, error: null }
  }
}
