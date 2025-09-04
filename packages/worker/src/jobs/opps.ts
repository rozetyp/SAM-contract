import 'dotenv/config';
import { makeDb, makePool, searches, sentNoticeIds, users, cronRuns } from '@sam/db';
import { and, eq, inArray } from 'drizzle-orm';
import { Resend } from 'resend';
import { setTimeout as delay } from 'node:timers/promises';

function stringify(obj: Record<string, string | number>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) usp.set(k, String(v));
  return usp.toString();
}
import { createDigestHtml } from '@sam/emails';

type SamRecord = {
  noticeId: string;
  solicitationNumber?: string;
  title?: string;
  description?: string;
  ptype?: string;
  postedDate?: string;
  naics?: string[];
  psc?: string[];
  setAside?: string[];
  url?: string;
  fullParentPathName?: string;
  organizationName?: string;
};

const SAM_BASE = process.env.SAM_API_BASE || 'https://api.sam.gov/opportunities/v2/search';

function buildQuery(params: Record<string, string | string[] | number | undefined>) {
  const qp: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) qp[k] = v.join(',');
    else qp[k] = String(v);
  }
  return qp;
}

function isBaseType(ptype?: string) {
  return ptype ? ['o', 'k', 'p'].includes(ptype) : true;
}

function dropAmendment(title?: string) {
  if (!title) return true;
  return !/amend|modif|corrigen/i.test(title);
}

function shouldInclude(title?: string, description?: string, includeWords?: string) {
  if (!includeWords?.trim()) return true;
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const words = includeWords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return words.some(word => text.includes(word));
}

function shouldExclude(title?: string, description?: string, excludeWords?: string) {
  if (!excludeWords?.trim()) return false;
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const words = excludeWords.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return words.some(word => text.includes(word));
}

export async function runOppsDigest({ daysBack = 2 }: { daysBack?: number } = {}) {
  console.log('🚀 Starting SAM.gov opportunities digest');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📅 Days back for search window:', daysBack);
  
  const pool = makePool();
  const db = makeDb(pool);
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Track cron run metrics
  const startTime = Date.now();
  let totalRecords = 0;
  let sentCount = 0;
  let cronRunId: number | null = null;

  console.log('🔑 Environment check:');
  console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'MISSING');
  console.log('  - SAM_OPPS_API_KEY:', process.env.SAM_OPPS_API_KEY ? 'SET' : 'MISSING');
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');

  try {
    // Start cron run tracking
    const [cronRun] = await db.insert(cronRuns).values({ 
      job: 'opps', 
      startedAt: new Date(),
      status: 'running'
    } as any).returning();
    cronRunId = cronRun.id;
    console.log('🔍 Fetching users from database...');
    const u = await db
      .select()
      .from(users)
      .where(inArray(users.plan as any, ['paid', 'trial'] as any));
    
    console.log(`👥 Found ${u.length} users:`, u.map(user => ({ 
      id: user.id, 
      email: user.email, 
      plan: user.plan 
    })));
    
    if (u.length === 0) {
      console.warn('⚠️  No users found - exiting');
      return;
    }

    const postedTo = new Date();
    // Use calendar days approach: query yesterday → today (2 days)
    // This handles timezone variations and weekend posting drift
    const postedFrom = new Date(postedTo);
    postedFrom.setDate(postedFrom.getDate() - (daysBack - 1)); // -1 because we include today

  for (const usr of u) {
      console.log(`\n👤 Processing user: ${usr.email} (ID: ${usr.id})`);
      
      const ss = await db.select().from(searches).where(eq(searches.userId, usr.id));
      console.log(`🔍 Found ${ss.length} search configurations for user`);
      
      const search = ss[0];
      if (!search) {
        console.log('⚠️  No search configuration found for user - skipping');
        continue;
      }
      
      console.log('🎯 Search criteria:', {
        // Legacy fields
        legacy_keywords: search.q,
        naics: search.naics,
        psc: search.psc,
        setAside: search.setaside,
        agency: search.agency,
        includeWords: search.includeWords,
        excludeWords: search.excludeWords,
        // Spec-compliant fields (preferred)
        ncode: search.ncode,
        ccode: search.ccode,
        typeOfSetAside: search.typeOfSetAside,
        organizationName: search.organizationName,
        organizationCode: search.organizationCode,
        qKeywordsInclude: search.qKeywordsInclude,
        qKeywordsExclude: search.qKeywordsExclude,
        // Value-booster mute filters
        muteAgencies: search.muteAgencies,
        muteTerms: search.muteTerms
      });

      const common = {
        postedFrom: `${(postedFrom.getMonth() + 1).toString().padStart(2, '0')}/${postedFrom.getDate().toString().padStart(2, '0')}/${postedFrom.getFullYear()}`,
        postedTo: `${(postedTo.getMonth() + 1).toString().padStart(2, '0')}/${postedTo.getDate().toString().padStart(2, '0')}/${postedTo.getFullYear()}`,
        limit: 1000,
        ptype: 'o,k,p',
        api_key: process.env.SAM_OPPS_API_KEY
      } as const;

      console.log('📅 Date range for API query:', {
        postedFrom: common.postedFrom,
        postedTo: common.postedTo,
        daysSpan: daysBack
      });

      // Use spec-compliant fields with fallback to legacy fields
      const naicsData = search.ncode || search.naics || [];
      const pscData = search.ccode || search.psc || [];
      const setAsideData = search.typeOfSetAside || search.setaside || [];
      const organizationName = search.organizationName || search.agency || '';
      const organizationCode = search.organizationCode || '';
      
      // Handle keywords - prefer spec arrays, fallback to legacy strings
      const includeKeywords = search.qKeywordsInclude?.length 
        ? search.qKeywordsInclude.join(' ') 
        : (search.includeWords || search.q || '');
      const excludeKeywords = search.qKeywordsExclude?.length
        ? search.qKeywordsExclude.join(' ')
        : (search.excludeWords || '');

      const params = buildQuery({
        ...common,
        q: includeKeywords || undefined,
        ncode: naicsData.length ? naicsData : undefined,
        ccode: pscData.length ? pscData : undefined,
        typeOfSetAside: setAsideData.length ? setAsideData : undefined,
        organizationName: organizationName || undefined,
        organizationCode: organizationCode || undefined
      });

      console.log('🌐 SAM API query params:', params);
      console.log('📡 Making API request to SAM.gov...');

      let offset = 0;
      const all: SamRecord[] = [];
      while (true) {
        console.log(`📄 Fetching page at offset ${offset}...`);
        const qs = stringify({ ...params, offset });
        const url = `${SAM_BASE}?${qs}`;

        // Simple retry mechanism instead of pRetry
        let res;
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const r = await fetch(url);
            if (r.status === 401) {
              console.error('SAM API error 401 Unauthorized');
              res = r; // do not retry
              break;
            }
            if (r.status === 429) {
              console.error('SAM API error 429 Too Many Requests');
              const ra = r.headers.get('retry-after');
              const ms = ra ? Number(ra) * 1000 : 1000;
              await delay(ms);
              continue; // Retry
            }
            if (r.status >= 500) {
              await delay(500);
              continue; // Retry
            }
            res = r;
            break;
          } catch (error) {
            lastError = error;
            if (attempt < 2) await delay(500); // Wait before retry
          }
        }
        
        if (!res) {
          throw lastError || new Error('Max retries exceeded');
        }

        const json: any = await res.json();
        const total: number = json.totalRecords ?? 0;
        console.log(`📊 API Response: ${total} total records, status: ${res.status}`);
        
        if (res.status === 401 || res.status === 429) {
          console.error('🚨 ALERT: SAM API auth/rate limited', res.status, { userId: usr.id });
        }
        if (total === 0) {
          console.warn('⚠️  WARN: zero records in window', { userId: usr.id, daysBack });
        }

        const items: SamRecord[] = (json.opportunitiesData || []).map((it: any) => ({
          noticeId: it.noticeId,
          solicitationNumber: it.solicitationNumber,
          title: it.title,
          description: it.description,
          ptype: it.ptype,
          postedDate: it.postedDate,
          naics: it.naicsCodes?.map((x: any) => x.naicsCode),
          psc: it.classificationCode?.split(',') || [],
          setAside: it.setAside?.split(',') || [],
          url: it.uiLink,
          fullParentPathName: it.fullParentPathName,
          organizationName: it.organizationName
        }));

        console.log(`📋 Processed ${items.length} items from this page`);
        all.push(...items);
        totalRecords += items.length;
        offset += items.length;
        if (offset >= total || items.length === 0) break;
      }

      console.log(`🎯 Total records fetched: ${all.length}`);
      
      // Apply guided filtering
      const filtered = all.filter((r) => {
        // Base filtering (existing)
        if (!isBaseType(r.ptype) || !dropAmendment(r.title)) {
          return false;
        }
        
        // Include words filtering (guided filter) - use spec or legacy
        if (!shouldInclude(r.title, undefined, includeKeywords || undefined)) {
          return false;
        }
        
        // Exclude words filtering (guided filter) - use spec or legacy  
        if (shouldExclude(r.title, undefined, excludeKeywords || undefined)) {
          return false;
        }
        
        // Mute agencies filtering (new value-booster)
        if (search.muteAgencies?.length) {
          const agency = r.fullParentPathName || r.organizationName || '';
          const shouldMuteAgency = search.muteAgencies.some(muteAgency => 
            agency.toLowerCase().includes(muteAgency.toLowerCase())
          );
          if (shouldMuteAgency) {
            return false;
          }
        }
        
        // Mute terms filtering (new value-booster)
        if (search.muteTerms?.length) {
          const text = `${r.title || ''} ${r.description || ''}`.toLowerCase();
          const shouldMuteTerm = search.muteTerms.some(muteTerm => 
            text.includes(muteTerm.toLowerCase())
          );
          if (shouldMuteTerm) {
            return false;
          }
        }
        
        return true;
      });
      
      console.log(`✅ Filtered records (base types, no amendments, keyword filters, mute filters): ${filtered.length}`);

      if (filtered.length === 0) {
        console.log('⚠️  No filtered records found for user - skipping');
        continue;
      }

      // Deduplicate against sent_notice_ids
      console.log('🔍 Checking for already sent notices...');
      const ids = Array.from(new Set(filtered.map((r) => r.noticeId)));
      const already = await db
        .select()
        .from(sentNoticeIds)
        .where(and(eq(sentNoticeIds.userId, usr.id), inArray(sentNoticeIds.noticeId, ids)));
      const alreadySet = new Set(already.map((r) => r.noticeId));
      const toSend = filtered.filter((r) => !alreadySet.has(r.noticeId));

      console.log(`📤 Already sent: ${already.length}, New to send: ${toSend.length}`);

      if (toSend.length === 0) {
        console.log('⚠️  No new notices to send for user - skipping');
        continue;
      }

      console.log('📝 Generating email content...');
      const html = createDigestHtml({ email: usr.email, records: toSend });

      if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
      if (process.env.RESEND_DRY === 'true') {
        console.log('🧪 RESEND_DRY mode - log only', { to: usr.email, count: toSend.length });
      } else {
        console.log(`📧 Sending email to ${usr.email} with ${toSend.length} opportunities...`);
        try {
          const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
          const result = await resend.emails.send({ 
            to: usr.email, 
            from, 
            subject: 'Your SAM.gov daily digest', 
            html 
          });
          console.log('✅ Email sent successfully:', result);
          sentCount += toSend.length;
        } catch (emailError) {
          console.error('❌ Email send failed:', emailError);
          throw emailError;
        }
      }

      // insert sent ids idempotently: individual inserts to avoid conflicts
      console.log('💾 Recording sent notice IDs in database...');
      for (const rec of toSend) {
        try {
          await db.insert(sentNoticeIds).values({ userId: usr.id, noticeId: rec.noticeId });
        } catch (e) {
          // ignore duplicates per idempotency requirement
          console.log(`⚠️  Duplicate notice ID ignored: ${rec.noticeId}`);
        }
      }
      console.log(`✅ User ${usr.email} processing complete\n`);
  }
  
  
  console.log('🎉 All users processed successfully');
  
  // Update cron run with success metrics
  if (cronRunId) {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    await db.update(cronRuns)
      .set({
        finishedAt: new Date(),
        durationMs,
        totalRecords,
        sentCount,
        status: 'completed',
        ok: true
      } as any)
      .where(eq(cronRuns.id, cronRunId));
    
    console.log('📊 Cron run metrics:', { 
      durationMs, 
      totalRecords, 
      sentCount, 
      status: 'completed' 
    });
  }
  } catch (err: any) {
    console.error('❌ Critical error in runOppsDigest:', err);
    
    // Update cron run with error details
    if (cronRunId) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      try {
        await db.update(cronRuns)
          .set({
            finishedAt: new Date(),
            durationMs,
            totalRecords,
            sentCount,
            status: 'failed',
            ok: false,
            errCode: err?.code || 'UNKNOWN',
            notes: String(err?.message || err)
          } as any)
          .where(eq(cronRuns.id, cronRunId));
      } catch {}
    }
    throw err;
  } finally {
    console.log('🔌 Closing database connection');
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOppsDigest().then(() => {
    // done
  });
}