# Agent Guidance

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

## Troubleshooting discipline

- Distinguish **deterministic failures** from **timing issues** before retrying.
  A command that fails instantly and identically every time (e.g. `error:
Cannot find binary path for command 'node'`) is not slow to start — retrying
  with a longer timeout is pointless. Diagnose the error after the first
  occurrence instead of assuming a startup-timing problem.
- After one `command not found`, switch to the known-good pattern above — do
  not try another PATH variant.
- When a standard tool call fails unexpectedly, **stop and explain the failure
  to the user before retrying**. Never launch into extended troubleshooting of
  basic tooling that should just work.
- Do not repeat failed strategies with minor variations (longer timeouts,
  different prefixes). After one or two failures, step back, state the
  hypothesis, and ask the user for advice or confirmation of their
  environment.
- The same applies at task level: after 2–3 failed attempts at the same fix,
  stop, write a short state summary (what was tried, current hypothesis), and
  check in with the user before continuing. It may also be appropriate to ask
  another agent, perform a web search, or try a genuinely different approach —
  as long as it actually breaks the loop rather than repeating it.
- When an investigation has a finite, enumerable search space (storage
  locations, config files, log folders), **write the enumeration script first
  and run it once** instead of issuing exploratory commands one at a time.
  Identical results must terminate the search, not trigger a re-run.

## Shareable rules

The portable version of these rules — for use in other projects — lives at
`docs/agent-terminal-rules.md`. Copy it into another project's `AGENTS.md` or
`.github/copilot-instructions.md` as-is.
