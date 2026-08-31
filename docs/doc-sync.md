# Documentation Sync Conventions

> **Revision:** 2026-08-31 — initial version, adapted from the
> `wsl-ubuntu-config-private` docs/plan.md conventions.
> See [docs/doc-sync.md](docs/doc-sync.md) for the conventions this file
> describes.

Docs must not drift from the codebase. This document defines the conventions
for keeping documentation current in this repo. It does **not** apply to
[`docs/agent-terminal-rules.md`](agent-terminal-rules.md), which has its own
distributed-copy workflow (see its header and § Meta-rules).

## Revision headers

Every doc carries a `> **Revision:** <date> — <summary>` blockquote near the
title. Update it whenever the doc's content changes materially (new section,
changed convention, corrected process). Trivial typo fixes don't require a
bump.

## Revision log

For repo-wide changes (tooling, workflow, conventions), append a row to the
**Revision Log** table below — newest first. This is the changelog of record
for docs and planning.

| Date | Change |
| --- | --- |
| 2026-08-31 | Restructured `AGENTS.md` after the `wsl-ubuntu-config-private` convention: Revision header, mandatory-reading block for `agent-terminal-rules.md` with top-6 restated rules, merged § Troubleshooting discipline into it (dedup). |
| 2026-08-31 | Resolved `sentences-per-line` migration (→ `markdownlint-sentences-per-line` 0.1.4); inlined prettier style into `.markdownlint-cli2.jsonc` (extension can't resolve package-style `extends`); rule temporarily disabled pending scope decision; `src/aoc/ad-hoc/archive/**` ignored. Baseline: 35 issues in 5 files. |
| 2026-08-31 | Opened investigation into `timeout`+`vpr` full-duration waits and the `sentences-per-line` 0.5.3 breakage; findings and next steps in `docs/handoff-timeout-vpr-and-sentences-per-line.md`. |
| 2026-08-31 | Established documentation sync conventions (this document): revision headers, revision log, sync checklist, canonical doc roles. Adapted from `wsl-ubuntu-config-private` `docs/plan.md`. |

## Sync checklist

After any change, ask:

- **Did a script/hook/config change?** → update the relevant section in
  `AGENTS.md` (agent-facing) and this file's Revision Log.
- **Was a new pain point or lesson discovered?** → append to `AGENTS.md`
  § Troubleshooting discipline (agent-facing) or the Revision Log here.
  Prefer extending an existing doc over creating a new one.
- **Was a decision made or reversed?** → record it in the Revision Log with
  the date and a pointer to the discussion or handoff doc.
- **Did agent-facing rules change?** → update `AGENTS.md`. If the rule is
  portable to other projects, also propose it for
  `docs/agent-terminal-rules.md` via that file's own edit workflow.
- **Is a doc superseded?** → move it to `docs/archive/` (create if absent)
  and leave a pointer in its place. Never delete history.
- **Is a doc a point-in-time handoff?** → handoff docs
  (`docs/handoff-*.md`, `docs/draft-*.md`) are frozen once their task
  completes; note completion in the Revision Log rather than editing them.

## Canonical doc roles

| Doc | Role |
| --- | --- |
| `AGENTS.md` | Agent-facing rules (concise; links out) |
| `README.md` | Human-facing overview + quickstart |
| `docs/doc-sync.md` | This file — doc conventions, revision log |
| `docs/agent-terminal-rules.md` | Distributed portable agent rules (own workflow; see its header) |
| `docs/handoff-*.md` | Point-in-time task handoffs (frozen after completion) |
| `docs/draft-*.md` | Drafts and working notes (promoted or archived when settled) |
| `docs/*.csv`, `docs/*.txt` | Generated artifacts (lint findings, rule summaries) — regenerate, don't hand-edit |
| `docs/archive/` | Superseded docs (preserved, never deleted) |

## Creating a new doc

Before creating a new file, check whether an existing doc can absorb the
content (see the sync checklist). If a new doc is warranted:

1. Add the `> **Revision:**` header.
2. Add a row to the Revision Log here.
3. Add it to the Canonical doc roles table (if it has a durable role).
4. Link it from `AGENTS.md` if agents need it.
