# AGENTS.md — Agent Instructions

> **Revision:** 2026-08-31 · See [docs/doc-sync.md](docs/doc-sync.md) for the doc
> revision log and conventions for keeping docs in sync with the codebase.

Guidance for AI coding agents (GitHub Copilot, Claude Code, Codex, etc.)
working in this repository — a coding-challenge and practice repo
(Codewars, Advent of Code, etc.); see § About this repo below.

---

## Agent Terminal Rules (read before running any command)

**[`docs/agent-terminal-rules.md`](docs/agent-terminal-rules.md) is mandatory
reading before invoking node/pnpm/vp/vpr, git network commands, or `gh` in an
agent terminal.** It is a distributed copy of the cross-project rules file
(source of truth: `~/projects/agent-terminal-rules.md`; sync via
`~/projects/sync-agent-rules.sh`). Every rule is empirically verified — most
were learned by burning tool calls on the failure first.

The rules most often violated under pressure, restated here for emphasis:

1. **"command not found" does not mean absent.** The sandbox gates bare
   invocations of known runtime/package-manager names (exit 127 even though
   the binary exists). Verify with `ls`, then use the absolute path
   (`~/.vite-plus/bin/...`). Never conclude a tool is missing from a 127.
2. **PATH exports are a dead end.** `export PATH=...`, `env -i PATH=...`, and
   inline `PATH=... cmd` prefixes do not reliably work in sandboxed terminals.
   After ONE failed PATH attempt, switch to absolute paths or the documented
   warm-up pattern — do not try another variant.
3. **Deterministic failure ≠ timing issue.** A command failing instantly and
   identically every time will not succeed on retry with a longer timeout.
   Diagnose after the FIRST occurrence. After 2–3 failed attempts at the same
   fix, stop, write a state summary, and check in with the user.
4. **Network commands need `requestAllowNetwork` in the same call**
   (`git push/fetch/pull`, `pnpm install`, `curl`). A sandboxed network
   failure looks like a generic fetch error — don't debug it, re-run with the
   flag.
5. **`gh` is not authenticated in agent terminals** — never retry or work
   around auth failures; ask the user to run the command.
6. **Per-file lint checks use `vp lint <file>`, never `vpr lint <file>`** —
   the npm script lints the whole project and ignores the path argument
   (see § Lint verification and autofix below).

<!--VITE PLUS START-->

## Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at <https://viteplus.dev/guide/>.

### Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

### Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

### Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Running scripts and tools

- Vite+ wraps the package manager, not the other way around. The package
  manager (pnpm) should never be the entry point for invoking `vp`.
  - Run project scripts with `vpr <script>` (e.g. `vpr test`, `vpr devtest`,
    `vpr tsc`). Do not use `pnpm run <script>` or `pnpm exec vp ...` — pnpm's
    script environment prepends `node_modules/.bin` to `PATH`, which breaks
    `vp`'s node resolution with `error: Cannot find binary path for command 'node'`.
  - Use `vp <command>` directly for built-in commands (`vp test`, `vp lint`, ...).
- If `node` doesn't work in a sandboxed terminal, `vp` won't either — they share
  the same runtime. Check `node --version` first before blaming the toolchain.
- Bare `node`/`pnpm` invocations fail in the sandboxed terminal with
  "command not found" (exit 127) **even though the binaries exist** — the
  sandbox gates bare invocations of known runtime/package-manager command
  names. The same binary executes fine via its absolute path (e.g.
  `~/.vite-plus/bin/node`) even sandboxed. "Not found" does not mean absent:
  verify before concluding a tool is missing.
- PATH exports do **not** reliably take effect across `run_in_terminal`
  invocations — each call may resolve in a fresh shell, and the sandbox
  intercepts resolution anyway. Don't burn runs on `export PATH=...` variants:
  - **`vpr`/`vp`**: on a cold terminal, prefix the warm-up
    `P="$HOME/.vite-plus/js_runtime/node/24.19.0/bin"; ls "$P/node" >/dev/null && vpr <cmd>`
    — empirically works; go straight to this, not PATH experiments.
  - **`pnpm`**: invoke the shim by absolute path (`~/.vite-plus/bin/pnpm`)
    with `CI=true`; skip PATH manipulation entirely.
- Any `pnpm` install/remove (and `git push`) needs network access — set
  `requestAllowNetwork` rather than debugging the resulting fetch failures.
- Set `CI=true` for all package-manager tooling (`pnpm install/remove/up`) —
  interactive prompts (Corepack downloads, pnpm confirmations) hang silently
  otherwise.

## Sandbox and environment

- Node, pnpm, and vite-plus live under `$HOME/.vite-plus` and
  `$HOME/.local/share/pnpm`. Sandboxed terminals may not see these paths; if a
  command fails with "command not found" or node-resolution errors, request
  unsandboxed execution (or use the absolute path under `~/.vite-plus/bin/`)
  rather than improvising PATH workarounds.
- The GitHub CLI (`gh`) is **not authenticated** in agent terminals. If a `gh`
  command fails with an auth prompt or "To get started with GitHub CLI" error,
  do not retry or work around it — ask the user to run the command or paste the
  output.

## Session forensics

When asked to audit what a past agent session did (exit codes, sandbox mode,
network access), check locations in this order:

1. **Windows host UI side** (authoritative, complete):
   `/mnt/c/Users/<user>/AppData/Roaming/Code/User/workspaceStorage/<ws-hash>/chatSessions/<session-id>.jsonl`
   — per-command `exitCode`, `requestUnsandboxedExecution`,
   `requestAllowNetwork`, `sandboxedExecution` (+ reason), `commandLine`.
   This is what the SESSIONS panel renders.
2. **WSL server-side transcript**
   (`~/.vscode-server/data/User/workspaceStorage/<ws-hash>/GitHub.copilot-chat/transcripts/<id>.jsonl`)
   — conversation events only. `tool.execution_complete` carries ONLY
   `{toolCallId, success}`; `success: true` means the tool call returned, NOT
   that the command exited 0. No exit codes, no sandbox flags.
3. **Server-side debug logs** (`GitHub.copilot-chat/debug-logs/<id>/`) —
   telemetry spans only. Sessions whose debug log never populates are
   permanently invisible to session indexing (`/chronicle`), even after force
   reindex.

## Long-running and interactive commands

- Watch-mode scripts (`vpr devtest`) and dev servers must run as background
  tasks, never as blocking terminal commands. Blocking on them hangs the
  terminal and invites retry loops.
- Commands that may trigger interactive prompts (Corepack version downloads,
  pnpm confirmations) will hang silently. Set `CI=true` or pass the
  non-interactive flag when running package-manager tooling.

## Lint verification and autofix (repo-specific)

This repo's `lint` script is `vp lint . --max-warnings 0
--report-unused-disable-directives` — note the `.`: it lints the whole
project, and a trailing path argument is effectively ignored.

- **Per-file lint checks must use `vp lint <file>` (the built-in), never
  `vpr lint <file>`.** `vpr lint <file>` runs the whole-project script and
  can report 0 findings while the file still has errors (observed: 39 real
  `perfectionist/sort-objects` errors in `vite.config.ts` invisible via
  `vpr lint <file>` but shown by `vp lint <file>` and the Problems panel).
- **`--fix-suggestions` is not idempotent** — re-sorting one object can
  expose new violations. Loop until 0, checking with the same command that
  reports the errors:
  ```sh
  until vp lint <file> 2>&1 | grep -q 'error'; do
    vp lint --fix-suggestions <file> || break
  done
  ```
  Observed: 39 errors needed 2+ passes. Review the diff afterwards —
  suggestion fixes can move comment-attached lines.
- `vp lint --fix` applies only safe fixes; `--fix-suggestions` applies
  suggestion-level fixes (e.g. `perfectionist/sort-objects`), which oxlint
  documents as "may change program behavior".
- Known accepted state: ~8 kata test failures and a few hundred Oxlint
  findings in `src/` are pre-existing; don't chase them when validating
  unrelated changes (see "About this repo" below).

## Commits

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`,
  `docs:`, ...). Draft commit messages when asked, but do not commit unless the
  user explicitly asks for it.

## About this repo

This is a coding-challenge and practice repo (Codewars, Advent of Code, etc.).
Testing and benchmarking tooling is part of the practice exercise itself, not
just infrastructure. Distinguish between:

- **Coding exercises** (`src/codewars/`, `src/aoc/`, `src/dcp/`, etc.) — the
  practice work. Some tests fail intentionally because katas are unfinished;
  these are expected and should not be "fixed" or diagnosed when validating
  unrelated changes.
- **Supporting code** (`src/dp/`, `src/text/`, `src/aoc/lib/`, tooling) — real
  code that should be linted, type-checked, and tested normally.

## Shareable rules

The portable version of these rules — for use in other projects — lives at
`docs/agent-terminal-rules.md`. Copy it into another project's `AGENTS.md` or
`.github/copilot-instructions.md` as-is.

## Documentation updates

Keep docs in sync with the codebase per `docs/doc-sync.md`: update the doc's
`Revision:` header on material changes, append repo-wide changes to its
Revision Log, and check its sync checklist before creating new docs. This
does not apply to `docs/agent-terminal-rules.md`, which has its own
distributed-copy workflow (see § Shareable rules and that file's header).
