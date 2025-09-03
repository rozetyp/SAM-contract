import { NextResponse } from 'next/server';

type SamRecord = {
  noticeId: string;
  title?: string;
  ptype?: string;
};

function buildQuery(params: Record<string, string | string[] | number | undefined>) {
  const qp: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) qp[k] = v.join(',');
    else qp[k] = String(v);
  }
  return qp;
}

function stringify(obj: Record<string, string | number>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) usp.set(k, String(v));
  return usp.toString();
}

function isBaseType(ptype?: string) {
  return ptype ? ['o', 'k', 'p'].includes(ptype) : true;
}

function dropAmendment(title?: string) {
  if (!title) return true;
  return !/amend|modif|corrigen/i.test(title);
}

function shouldInclude(title?: string, includeWords?: string) {
  if (!includeWords?.trim()) return true;
  const text = title?.toLowerCase() || '';
  const words = includeWords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return words.some(word => text.includes(word));
}

function shouldExclude(title?: string, excludeWords?: string) {
  if (!excludeWords?.trim()) return false;
  const text = title?.toLowerCase() || '';
  const words = excludeWords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return words.some(word => text.includes(word));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Get search criteria
    const naics = Array.isArray(body.naics) ? body.naics : 
                  String(body.naics || '').split(',').map((s) => s.trim()).filter(Boolean);
    const psc = Array.isArray(body.psc) ? body.psc : 
                String(body.psc || '').split(',').map((s) => s.trim()).filter(Boolean);
    const setaside = Array.isArray(body.setaside) ? body.setaside : 
                     String(body.setaside || '').split(',').map((s) => s.trim()).filter(Boolean);
    const agency = String(body.agency || '').trim();
    const includeWords = String(body.includeWords || '').trim();
    const excludeWords = String(body.excludeWords || '').trim();
    
    // Use last 7 days for preview
    const windowDays = 7;
    const postedTo = new Date();
    const postedFrom = new Date(postedTo.getTime() - windowDays * 24 * 3600_000);

    const SAM_BASE = process.env.SAM_API_BASE || 'https://api.sam.gov/opportunities/v2/search';
    
    const common = {
      postedFrom: `${(postedFrom.getMonth() + 1).toString().padStart(2, '0')}/${postedFrom.getDate().toString().padStart(2, '0')}/${postedFrom.getFullYear()}`,
      postedTo: `${(postedTo.getMonth() + 1).toString().padStart(2, '0')}/${postedTo.getDate().toString().padStart(2, '0')}/${postedTo.getFullYear()}`,
      limit: 100, // Smaller limit for preview
      ptype: 'o,k,p',
      api_key: process.env.SAM_OPPS_API_KEY
    } as const;

    const params = buildQuery({
      ...common,
      q: includeWords || undefined,
      ncode: naics.length ? naics : undefined,
      ccode: psc.length ? psc : undefined,
      typeOfSetAside: setaside.length ? setaside : undefined,
      organizationName: agency || undefined
    });

    const qs = stringify(params);
    const url = `${SAM_BASE}?${qs}`;

    const response = await fetch(url);
    const json: any = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: 'SAM API error', status: response.status }, { status: 500 });
    }

    const total: number = json.totalRecords ?? 0;
    const items: SamRecord[] = (json.opportunitiesData || []).map((it: any) => ({
      noticeId: it.noticeId,
      title: it.title,
      ptype: it.ptype
    }));

    // Apply filtering
    const filtered = items.filter((r) => {
      if (!isBaseType(r.ptype) || !dropAmendment(r.title)) return false;
      if (!shouldInclude(r.title, includeWords)) return false;
      if (shouldExclude(r.title, excludeWords)) return false;
      return true;
    });

    return NextResponse.json({
      totalRecords: total,
      filteredCount: filtered.length,
      sampleTitles: filtered.slice(0, 5).map(r => r.title),
      windowDays,
      criteria: {
        naics,
        psc,
        setaside,
        agency,
        includeWords,
        excludeWords
      }
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
