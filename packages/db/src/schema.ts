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
  job: varchar('job', { length: 64 }).notNull(),
  ok: boolean('ok').notNull().default(true),
  error: text('error'),
  ranAt: timestamp('ran_at').notNull().defaultNow()
});