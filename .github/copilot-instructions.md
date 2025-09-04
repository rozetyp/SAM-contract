# Product thesis (what we are / aren’t)

* **We are**: the **best email-only signal** for federal **contract opportunities**—taxonomy-first filters, **base notices only**, dedupe, and one clean **daily digest**.
* **We aren’t**: a full BD suite (intel, pipeline, SLED, exports-at-scale, API, AI workspace). Those are HigherGov/GovTribe. Our price is **\$19/mo (≈\$228/yr)** vs. **HigherGov Starter \$500/yr** and **GovTribe plans from \$1,800/yr**. ([HigherGov][1], [GovTribe][2])

# Facts we must honor (API & ecosystem)

* **SAM Opportunities v2**: `postedFrom/postedTo` **required** (MM/dd/yyyy, ≤1y span), **latest active version only**, **`limit≤1000` + `offset`** paging, filters include **`ncode` (NAICS)**, **`ccode` (PSC)**, **`typeOfSetAside`**, **`organizationName/Code`**, and **`ptype`** (e.g., o,k,p). `postedDate` returned with timestamp. ([GSA Open Technology][3])
* **Saved-search email exists in SAM** (our comparison anchor): official help includes “How to get email notifications of saved search results.” ([SAM.gov][4])
* **Exclusions API**: public, paginated; v4 endpoint, params inc. **`ueiSAM`**, `exclusionName`, date filters; rate-tier table provided. ([GSA Open Technology][5])
* **.ics format**: RFC 5545 `VCALENDAR/VEVENT` with UTC times. ([IETF Datatracker][6], [iCalendar][7])
* **Stripe webhooks**: **verify signature on the raw request body**. ([Stripe Docs][8])
* **Resend**: **domain verification (SPF+DKIM)**; subdomains recommended for reputation. ([Resend][9])

---

# Personas & JTBD

* **Solo vendor / micro-prime / proposal freelancer**

  * **Job**: “Tell me **new, relevant federal opportunities** daily, without wading through amendments & dupes.”
  * **Success**: 2–5 viable opportunities/week, <5 minutes triage/day, clear calendar deadlines.

---

# Core product (must)

## Saved search (1 per paid user)

**Implement this way**

* **Guided-first** inputs: **NAICS (`ncode[]`)**, **PSC (`ccode[]`)**, **Set-Aside (`typeOfSetAside[]`)**, **Agency (`organizationName` or `organizationCode`)**. Optional **Include/Exclude terms** (keywords as secondary).
* **Persisted**: `ncode text[]`, `ccode text[]`, `type_of_set_aside text[]`, `organization_name text`, `organization_code text`, `include_terms text[]`, `exclude_terms text[]`, `mute_terms text[]`, `mute_agencies text[]`.
* **Validation**: NAICS 2–6 digits; PSC alphanumeric; arrays coalesced to `{}`; 1 search per user (unique index).

**Acceptance**

* Valid filters map to SAM v2 params; payload contains **only** supported keys; rejects unknowns.
* One saved search per user enforced by DB unique key.

## Fetch & filter

**Implement this way**

* **Window**: **two calendar days** (`postedFrom=yesterday`, `postedTo=today` per MM/dd/yyyy constraint); rely on **idempotency & dedupe** for exactness. (Optional: apply an app-side cutoff to \~25h using `postedDate` timestamp for “last\_successful\_run + 25h”.) ([GSA Open Technology][3])
* **Request**: `ptype=o,k,p`; add `ncode/ccode/typeOfSetAside/organizationName/Code` if present; `limit=1000`, **loop `offset`** until `offset + count ≥ totalRecords`. ([GSA Open Technology][3])
* **Noise control**: keep **`baseType ∈ {o,k,p}`**, drop titles `/amend|modif|corrigen/i`, apply **per-user dedupe** by `(user_id, noticeId)`.

**Acceptance**

* Proof run logs show proper paging; second run on same window sends **0** new items.

## Email digest (daily 13:00 UTC)

**Implement this way**

* **Header**: “X new opportunities (last 48h)”; chips for active filters.
* **Cards**: title → agency (**`fullParentPathName`**), **deadline (rdl/responseDeadLine)**, **baseType**, **NAICS/PSC tags**, “Open in SAM” link.
* **Inline actions**: **Mute agency** / **Mute term** (signed link).
* **Footer**: **Trending terms** (48h/7d), **Manage filters**, legal note “Not affiliated with GSA/SAM.gov.”
* **Delivery**: From verified domain via **Resend** (SPF+DKIM). ([Resend][9])

**Acceptance**

* 1 email/day/user; DKIM/SPF pass; links valid; text and HTML parts render.

## Billing & gating (Stripe)

**Implement this way**

* **Price**: **\$19/month**, Stripe Checkout (monthly only).
* **Webhook**: **raw body** + signature verification; on `checkout.session.completed`, set `plan='paid'` and persist `stripe_customer_id`. Reject invalid signatures; idempotent by event id. ([Stripe Docs][8])
* **Gate**: Only **paid** can save/modify the search.

**Acceptance**

* Happy path flips user to **paid**; invalid signature path 4xx; retries are idempotent.

## Health & ops

**Implement this way**

* **`cron_runs`**: `started_at, finished_at, duration_ms, total_records, sent_count, status, err_code, notes`.
* **/api/health**: last run snapshot; worker **closes DB pool** and exits.

**Acceptance**

* Health shows status=`ok` after a successful send; unclean exit triggers `status='error'`.

---

# Value boosters (should — 3–5 dev-days)

## 1) Mute from email

**Implement this way**

* Signed **magic links** (JWT HMAC) in cards to **mute agency** OR **mute term**; tokens include `sub, act, scope, value, exp, nonce`.
* `/u/mute?token=…` updates arrays (`mute_agencies`/`mute_terms`), idempotent, returns confirmation + **Undo** (inverse token).

**Acceptance**

* Valid token → updated; re-use → no duplicates; tampered/expired → 401; next digest excludes.

## 2) .ics per notice + daily calendar feed

**Implement this way**

* **Per-notice ICS**: `/calendar/notice/:noticeId.ics` → `VCALENDAR` with one `VEVENT` (UTC `DTSTART`, `DTEND`, `UID=<noticeId>@bidbeacon`, `SUMMARY`, `DESCRIPTION`, `URL`).
* **Daily feed ICS** (auth): `/calendar/daily.ics` aggregating upcoming deadlines.

**Acceptance**

* Files parse per **RFC 5545** and import into Google/Outlook; timestamps match deadlines. ([IETF Datatracker][6], [iCalendar][10])

## 3) CSV export (day’s digest)

**Implement this way**

* `/api/export/digest.csv?date=YYYY-MM-DD` (auth).
* Columns: `noticeId,title,agency,baseType,postedDate,deadline,naics,psc,setAside,url`.
* Data source: snapshot captured at send time (avoid re-query drift).

**Acceptance**

* Row count = email cards; opens cleanly in Excel/Sheets.

## 4) Exclusions mini-monitor (≤5 watches)

**Implement this way**

* UI: add up to **5** watches (entity name **or** **UEI**).
* Worker: query **Exclusions API v4**; if new record/status since `last_seen_id`, send transactional email; update pointer. Respect published rate tiers and pagination. ([GSA Open Technology][5])

**Acceptance**

* New exclusion → email + DB updated; no change → no email; 429/5xx → retried with jitter; capped watches enforced.

---

# Landing & SEO (separate public page)

**Implement this way**

* **Sections**: Hero → 3-step “How it works” → **Sample email** image → **Comparison table** (SAM saved search / HigherGov / GovTribe) → Pricing → FAQ → legal note.
* **Structured data**: `Product` (name, brand, **price 19.00 USD**, URL). **FAQPage** optional (don’t depend on rich results).
* **Design**: Gov-adjacent palette (navy/slate/off-white) + Inter/Public Sans; **top and footer** disclaimer: “Not affiliated with GSA/SAM.gov.”

**Comparison sources to link**

* **HigherGov Starter \$500/yr + feature list**.
* **GovTribe** 14-day trial + plan pricing.
* **SAM saved-search notifications** help. ([HigherGov][1], [GovTribe][2], [SAM.gov][4])

**Acceptance**

* Public route (no auth), canonical + meta, **Product JSON-LD** validates; price on page matches schema; comparison links resolve.

---

# Data model (final)

* `users(id, email unique, plan enum['trial','paid'], stripe_customer_id, created_at)`
* `searches(id, user_id unique ref users, ncode text[], ccode text[], type_of_set_aside text[], organization_name text, organization_code text, include_terms text[], exclude_terms text[], mute_terms text[], mute_agencies text[], updated_at)`
* `sent_notice_ids(id, user_id, notice_id, sent_at, unique(user_id, notice_id))`
* `cron_runs(id, started_at, finished_at, duration_ms, total_records, sent_count, status, err_code, notes)`
* `exclusion_watches(id, user_id, entity text, uei text, last_seen_id text, created_at)`
* `exclusion_alerts(id, user_id, watch_id, exclusion_id text, seen_at)`

---

# System & ops

* **Cron**: Railway daily **13:00 UTC**.
* **Retry/backoff**: 429/5xx exponential with jitter (both SAM v2 and Exclusions).
* **Logging**: warn zero results; error 401/429 spikes; log send counts per user.
* **Security**: short-lived JWTs for magic links; CSRF not applicable to GET action tokens; Stripe webhook read **raw body** only; lock environment secrets. ([Stripe Docs][8])
* **Email deliverability**: verify domain (SPF+DKIM); prefer subdomain (e.g., `alerts.example.com`). ([Resend][9])

---

# Tests (go/no-go gates)

* **Contract (SAM v2)**: require `postedFrom/postedTo`; `limit≤1000`; paging stops at `totalRecords`; `ptype=o,k,p`. **postedDate** timestamps present. ([GSA Open Technology][3])
* **Idempotency**: second run same window → **0** new sends.
* **Noise**: all delivered have **`baseType ∈ {o,k,p}`**; amendment-pattern titles suppressed. ([GSA Open Technology][3])
* **Mute**: token happy/expired/tampered; idempotent updates.
* **ICS**: validator confirms `VCALENDAR/VEVENT` and UTC fields. ([IETF Datatracker][6])
* **CSV**: stable header, correct rows.
* **Exclusions**: mock “new record” → email; no change → silent; rate-limit retry. ([GSA Open Technology][5])
* **Stripe**: raw-body verification happy/negative; idempotent events. ([Stripe Docs][8])
* **Resend**: verified domain; production send received. ([Resend][9])
* **Landing/SEO**: Product JSON-LD validates; price visible & matching; comparison links to **HigherGov/GovTribe/SAM help** resolve. ([HigherGov][1], [GovTribe][2], [SAM.gov][4])

---

# Why \$19/mo is justified (succinct)

* **Direct competitor anchor**: HigherGov **\$500/yr** Starter; GovTribe **\$1,800/yr+** plans—**suites** for full BD. We’re a **focused alerts layer** at **<½** HigherGov’s entry cost, with **monthly, cancel anytime**. ([HigherGov][1], [GovTribe][2])
* **Clear delta vs free**: SAM emails exist but are **noisy** and not opinionated; we default to **base notices**, **dedupe**, **mute**, **ICS**, **CSV**, **mini-Exclusions**—a time-saving bundle free SAM doesn’t deliver end-to-end. ([SAM.gov][4])

---

# Non-goals (now)

* No multi-search per user, no SLED feeds, no exports-at-scale/API, no AI summarization, no dashboards/pipeline.

---

# Launch acceptance checklist (final)

* **One successful production digest** per the above rules (at least 1 user).
* Stripe webhook **raw-body** verified → `paid`. ([Stripe Docs][8])
* Landing live with **Product JSON-LD** and comparison links; **not-affiliated** notice present.
* **Mute**, **ICS**, **CSV**, **Exclusions mini-monitor** all pass their acceptance tests.
* `/api/health` shows last `cron_runs` with `status='ok'`.