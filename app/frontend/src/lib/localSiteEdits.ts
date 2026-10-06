export type SiteEditRow = {
  id: number;
  page: string;
  element_key: string;
  edit_type: string;
  value: string;
};

const STORAGE_KEY = 'eam-site-edits-local-v1';

function readAll(): SiteEditRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SiteEditRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: SiteEditRow[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 5000)));
}

function nextLocalId(rows: SiteEditRow[]): number {
  let min = 0;
  for (const row of rows) {
    if (row.id < min) min = row.id;
  }
  return min - 1;
}

export function loadLocalEditsForPage(page: string): SiteEditRow[] {
  return readAll().filter((row) => row.page === page);
}

export function upsertLocalEdit(
  page: string,
  element_key: string,
  edit_type: string,
  value: string,
): SiteEditRow {
  const all = readAll();
  const idx = all.findIndex((row) => row.page === page && row.element_key === element_key);
  if (idx >= 0) {
    all[idx] = { ...all[idx], edit_type, value };
    writeAll(all);
    return all[idx]!;
  }
  const row: SiteEditRow = {
    id: nextLocalId(all),
    page,
    element_key,
    edit_type,
    value,
  };
  all.push(row);
  writeAll(all);
  return row;
}

export function deleteLocalEdit(id: number): void {
  if (id >= 0) return;
  writeAll(readAll().filter((row) => row.id !== id));
}

/** Local overrides win for the same element_key on a page. */
export function mergeEditsForPage(remote: SiteEditRow[], local: SiteEditRow[]): SiteEditRow[] {
  const byKey = new Map<string, SiteEditRow>();
  for (const row of remote) byKey.set(row.element_key, row);
  for (const row of local) byKey.set(row.element_key, row);
  return Array.from(byKey.values());
}

export function isLocalEditId(id: number): boolean {
  return id < 0;
}
