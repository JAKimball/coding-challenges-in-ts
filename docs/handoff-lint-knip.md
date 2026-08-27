# Handoff: Fix the Lint Knip workflow

## Context

The `Lint Knip` workflow (`.github/workflows/lint-knip.yml`) runs `vpr lint:knip`
→ `knip` and fails with exit 1. The CI setup itself is fine — the failure is
genuine Knip findings that need **policy decisions**, not bug fixes. Latest
failing run: https://github.com/JAKimball/coding-challenges-in-ts/actions/runs/32930634814

Repo state as of this handoff:

- Branch `main`, Vite+ toolchain (`vp`/`vpr`), pnpm 11.24.0
- Config: `knip.jsonc` at repo root (see below)
- This is a personal practice repo (Codewars katas, Advent of Code, etc.) —
  never published to npm. Most "unused" files are intentionally standalone.

```jsonc
// knip.jsonc (current)
{
  "$schema": "https://unpkg.com/knip/schema.json",
  "entry": ["src/index.ts!"],
  "ignoreBinaries": ["dedupe", "gh"],
  "ignoreDependencies": [
    // TODO: investigate if these are still flagged, and file issues if not
    "all-contributors-cli",
    "c8",
  ],
  "ignoreExportsUsedInFile": { "interface": true, "type": true },
  "project": "src/**/*.ts!",
}
```

`src/index.ts` only re-exports `./greet.js` and `./types.js`, so everything
else in `src/` is unreachable from the single entry point.

## Current findings (from CI)

1. **Unused files (57)** — every kata/practice file: `src/aoc/**`,
   `src/codewars/**` (all years), `src/dcp/problem-545.ts`,
   `src/hackerrank/3d-surface-area.ts`, `src/text/md-direct-link.ts`,
   `src/aoc/ad-hoc/*`, `src/aoc/lib/index.ts`, templates.
2. **Unused dependencies (1)** — `uuid` (runtime dep; check if actually used,
   likely removable or used by a script).
3. **Unused devDependencies (7)** — `eslint-plugin-jsonc`,
   `eslint-plugin-no-only-tests`, `eslint-plugin-perfectionist`,
   `eslint-plugin-regexp`, `eslint-plugin-yml`, `globals`,
   `sentences-per-line`.
4. **Unused exports (6)** — `ackermann_test`/`ackermann_tests`
   (`src/dp/ackermann.ts`), `testFib`/`testGridTraveler`/`testNumWays`/
   `boundary_test` (`src/dp/fib.ts`). These look like leftover helper exports.
5. **Configuration hints (5)** — stale ignore entries:
   - `ignoreDependencies`: `all-contributors-cli`, `c8` no longer flagged → remove
   - `ignoreBinaries`: `dedupe`, `gh` no longer flagged → remove
     (but see caveat below re: `gh`)
6. Also note: `markdownlint` devDep was removed in favor of
   `markdownlint-cli2`; `sentences-per-line` IS still used but only via
   knip's own custom-rule loading (`customRules` in
   `.markdownlint-cli2.jsonc`) which Knip can't see — hence flagged.

## The core policy question

Knip's model doesn't fit a kata repo out of the box: each kata file is an
independent program, not a library module. Options:

### Option A — Treat all source files as entry points (recommended starting point)

```jsonc
"entry": ["src/index.ts!", "src/**/*.ts!"],
```

- Eliminates all 57 unused-file findings.
- Kata files use in-source tests (`import.meta.vitest`) — verify Knip picks
  those up; if not, may also need `"vitest"` plugin config or adding
  `src/**/*.test.ts` patterns.
- Unused _exports within_ reachable files would still be reported (the 6 dp/
  exports) unless `ignoreExportsUsedInFile` covers them (it currently only
  covers interface/type).

### Option B — Ignore the practice trees

```jsonc
"ignore": ["src/aoc/**", "src/codewars/**", "src/dcp/**", "src/hackerrank/**", "src/text/**"],
```

- Keeps Knip focused on "real" code (`src/dp/`, `src/greet.ts`, etc.).
- Less noisy but hides genuinely dead code inside ignored trees.

### Option C — Delete the findings

Remove `uuid` if truly unused, delete the 6 unused exports in `src/dp/`,
remove the 7 unused devDeps (but keep `sentences-per-line` — needed at
runtime by markdownlint-cli2 customRules; add it to `ignoreDependencies`
with a comment instead).

## Recommended plan

1. Apply Option A's entry change first; run `pnpm lint:knip` locally to see
   what remains.
2. Clean up stale ignores (hint items) — but keep `gh` in `ignoreBinaries`
   if any workflow/docs reference it (it was there for a reason; check git
   history of knip.jsonc).
3. Decide on `sentences-per-line`: add to `ignoreDependencies` with a
   comment explaining it's loaded dynamically by markdownlint-cli2.
4. Handle `uuid`: grep for usage; remove dep + any dead code using it.
5. The 6 unused exports in `src/dp/`: they appear to be test helpers for
   manual experimentation. Either un-export (make local), delete, or add
   `ignoreExportsUsedInFile: { ... }` entries as appropriate.
6. Remaining eslint-plugin-* / globals devDeps: these are leftovers from the
   pre-Vite+ ESLint setup (ESLint was removed in the migration). Safe to
   uninstall — verify nothing references them (`grep -r eslint-plugin
--include='*.ts' --include='*.jsonc' .` excluding node_modules).
7. Commit as one change; push; confirm Lint Knip goes green.

## Gotchas

- Run knip via `vpr lint:knip` (or `pnpm lint:knip`) from repo root.
- The sandboxed agent terminal has flaky access to `~/.vite-plus` binaries;
  warm up with `ls "$P/node" >/dev/null` where
  `P=/home/jonathan/.vite-plus/js_runtime/node/24.19.0/bin` before running
  node-based tools, or just use your own terminal.
- Husky pre-commit may fail in sandbox (`pnpm not found`); use
  `--no-verify` and note it in the commit if so.
- Don't touch unfinished katas while cleaning (8 known test failures are
  accepted state).
- `.markdownlint-cli2.jsonc` and per-directory markdown style decisions are
  a SEPARATE in-flight task — don't bundle into this one.

## Definition of done

- `vpr lint:knip` exits 0 locally.
- Push → `Lint Knip` workflow green on GitHub Actions.
- No unrelated workflows regress (Test/Lint remain red for their own known
  reasons: 8 kata failures, ~376 Oxlint findings — both tracked separately).
