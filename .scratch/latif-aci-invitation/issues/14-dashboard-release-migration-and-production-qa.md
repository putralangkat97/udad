---
category: release
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 14: Dashboard Release Migration and Production QA

**What to build:** Make the managed invitation dashboard safe to release by
running the migration and initial seed in staging, verifying the public and
admin workflows, and preparing production rollout with recovery steps.

**Blocked by:** 13: Validation and Atomic Publish

**Status:** ready-for-qa

- [ ] Run database migrations and the idempotent initial config seed in staging.
- [ ] Verify the initial published version matches the current invitation.
- [ ] Back up the database before production migration.
- [ ] Verify restore or rollback steps before production rollout.
- [ ] Verify admin authorization, draft save, preview, validation, publish, and
      media reference protection in staging.
- [ ] Verify public invitation behavior after migration, including cover,
      audio, countdown, RSVP, gallery, gifts, and story.
- [x] Verify the public root never displays an incomplete draft.
- [ ] Confirm production environment configuration, storage permissions, HTTPS,
      and asset delivery.
- [x] Record release notes and a clear fallback plan for the configuration
      source during rollout.

## Agent verification

The local migration status, config parity test, automated QA suite, typecheck,
formatter, and production build have passed. Staging and production execution
remain pending because this workspace has no access to those environments; use
the release runbook in `docs/releases/14-dashboard-release-and-production-qa.md`
to complete and record those checks.
