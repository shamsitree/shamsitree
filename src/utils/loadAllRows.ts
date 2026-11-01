/** Read every page in stable primary-key order. Never return partial data after an error. */
export async function loadAllRows<T>(makeQuery: () => any, pageSize = 500): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('Invalid page size');
  const rows: T[] = [];
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await makeQuery().order('id', { ascending: true }).range(start, start + pageSize - 1);
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Invalid database response');
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}
