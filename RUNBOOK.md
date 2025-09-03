# Runbook

Cron jobs:
- SAM.gov Opportunities Digest: pnpm -w run cron:opps (schedule daily 13:00 UTC)
	- Requirement: job must finish and exit cleanly (DB pool closed) per Railway cron.

Environment:
- Set envs from .env.example in Railway project variables.

Migrations:
- pnpm -w run db:generate
- pnpm -w run db:migrate

Release checks:
- One successful production digest email sent for each SAM job.
- 401/429 logs visible and rate limit backoff behavior verified.
- Zero-record window warns but does not fail.

Monitoring:
- Health: GET /api/health returns { ok: true }
- Stripe webhook logs
- Cron failure banner on settings (placeholder) if last run failed.

Stripe Setup:
- Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET.
- Configure a webhook endpoint to {APP_BASE_URL}/api/stripe/webhook for events:
	checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted.
- Trial users receive digests; cancellation downgrades to canceled and disables digests.
