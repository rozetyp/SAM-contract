import { pgTable, serial, text, timestamp, integer, varchar, primaryKey, boolean, json, unique, numeric, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  plan: varchar('plan', { length: 32 }).notNull().default('paid'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  loginCount: integer('login_count').default(0)
});

export const searches = pgTable('searches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  q: text('q'), // Legacy field for backward compatibility
  
  // Spec-compliant field names
  qKeywordsInclude: text('q_keywords_include').array(), // Include words as array
  qKeywordsExclude: text('q_keywords_exclude').array(), // Exclude words as array
  ncode: text('ncode').array(), // NAICS codes
  ccode: text('ccode').array(), // PSC codes
  typeOfSetAside: text('type_of_set_aside').array(), // Set-aside programs
  organizationName: text('organization_name'), // Agency name
  organizationCode: text('organization_code'), // Agency code
  
  // Mute functionality fields (per product spec)
  muteTerms: text('mute_terms').array(), // Terms to mute from emails
  muteAgencies: text('mute_agencies').array(), // Agencies to mute from emails
  
  // Legacy fields for backward compatibility
  naics: text('naics').array(),
  psc: text('psc').array(),
  setaside: text('setaside').array(),
  agency: text('agency'),
  includeWords: text('include_words'),
  excludeWords: text('exclude_words'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  // UNIQUE constraint: one search per user
  uniqueUserSearch: unique().on(table.userId)
}));

export const sentNoticeIds = pgTable(
  'sent_notice_ids',
  {
    userId: integer('user_id').notNull(),
    noticeId: varchar('notice_id', { length: 128 }).notNull(),
    sentAt: timestamp('sent_at').notNull().defaultNow()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.noticeId] })
  })
);

export const cronRuns = pgTable('cron_runs', {
  id: serial('id').primaryKey(),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'),
  durationMs: integer('duration_ms'),
  totalRecords: integer('total_records'),
  sentCount: integer('sent_count'),
  status: varchar('status', { length: 32 }).notNull().default('running'), // running, ok, error
  errCode: varchar('err_code', { length: 64 }),
  notes: text('notes'),
  
  // Legacy fields for backward compatibility
  job: varchar('job', { length: 64 }).notNull().default('opps'),
  ok: boolean('ok').notNull().default(true),
  error: text('error'),
  ranAt: timestamp('ran_at').notNull().defaultNow()
});

// Value-booster: Exclusions mini-monitor (≤5 watches per spec)
export const exclusionWatches = pgTable('exclusion_watches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  entity: text('entity'), // Entity name to watch
  uei: text('uei'), // UEI to watch (alternative to entity)
  lastSeenId: text('last_seen_id'), // Track last seen exclusion ID
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const exclusionAlerts = pgTable('exclusion_alerts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  watchId: integer('watch_id').notNull(),
  exclusionId: text('exclusion_id').notNull(), // ID from GSA Exclusions API
  seenAt: timestamp('seen_at').notNull().defaultNow()
});