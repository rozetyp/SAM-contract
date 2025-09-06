export function stringify(obj: Record<string, string | number>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) usp.set(k, String(v));
  return usp.toString();
}

export function buildQuery(params: Record<string, string | string[] | number | undefined>) {
  const qp: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) qp[k] = v.join(',');
    else qp[k] = String(v);
  }
  return qp;
}

export function isBaseType(ptype?: string) {
  return ptype ? ['o', 'k', 'p'].includes(ptype) : true;
}

export function dropAmendment(title?: string) {
  if (!title) return true;
  return !/amend|modif|corrigen/i.test(title);
}

export function shouldInclude(title?: string, description?: string, includeWords?: string) {
  if (!includeWords?.trim()) return true;
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const words = includeWords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return words.some(word => text.includes(word));
}

export function shouldExclude(title?: string, description?: string, excludeWords?: string) {
  if (!excludeWords?.trim()) return false;
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const words = excludeWords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return words.some(word => text.includes(word));
}

export function formatMMDDYYYY(d: Date) {
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export default {};
