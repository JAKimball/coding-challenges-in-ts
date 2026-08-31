# Agent Terminal Rules (Vite+ / pnpm / WSL / VS Code agent harness)

> **⚠ This file is a distributed copy.** The source of truth lives at
> `~/projects/agent-terminal-rules.md`. After editing the central file, run
> the sync script to propagate to all repos:
>
> ```sh
> ~/projects/sync-agent-rules.sh
> ```
>
> If you are editing _this_ copy, copy your changes back to the central file
> first, then sync — otherwise the next sync will silently overwrite them.
> (Note: agents in sandboxed terminals cannot see or write the central file
> at `~/projects/` — hand the edit to the user, or apply it in the repo copy
> and ask the user to copy it back before syncing.)

<!-- -->

> Portable rules for AI coding agents working in this environment. Copy into a
> project's `AGENTS.md` or `.github/copilot-instructions.md`. Every rule below
> is empirically verified — most were learned by burning tool calls on the
> failure first. Sources: repo memory (`agent-terminal-node-pnpm-vpr.md`,
> `vscode-env-notes.md`, `copilot-chat-storage-locations.md`) and session
> forensics from the coding-challenges-in-ts repo (2026-08).

## 1. Command invocation — get it right the first time

- **Vite+ wraps the package manager, never the reverse.** Run project scripts
  with `vpr <script>` (e.g. `vpr test`, `vpr lint:knip`). Never `pnpm run` or
  `pnpm exec vp` — pnpm's script environment prepends `node_modules/.bin` to
  PATH, which breaks vp's node resolution
  (`error: Cannot find binary path for command 'node'`).

- **`vpr`/`vp` on a cold terminal fails with `command not found` (exit 127).**
  Go straight to the warm-up prefix — do not experiment:

  ```sh
  P="$HOME/.vite-plus/js_runtime/node/24.19.0/bin"; ls "$P/node" >/dev/null && vpr <cmd>
  ```

  The warm-up primes PATH resolution for subsequent calls in the session.

- **`pnpm`: invoke the shim by absolute path with `CI=true`.**

  ```sh
  CI=true "$HOME/.vite-plus/bin/pnpm" <install|remove|up> <pkg>
  ```

  Bare `pnpm` fails with exit 127 even though the binary exists. `CI=true`
  prevents silent hangs on interactive prompts (Corepack version downloads,
  pnpm confirmations).

- **PATH exports do not reliably persist across `run_in_terminal` calls.**

  Each call may resolve in a fresh shell, and the sandbox intercepts
  resolution anyway. `export PATH=...` variants are wasted runs — verified
  empirically: 4 consecutive PATH-export attempts all failed with 127 before
  switching to absolute paths.

- **"command not found" does not mean absent.** The sandbox gates bare
  invocations of known runtime/package-manager command names. The same binary
  executes fine via its absolute path (`~/.vite-plus/bin/node`,
  `~/.vite-plus/bin/pnpm`) even sandboxed. Verify with `ls` before concluding
  a tool is missing.

## 2. Sandbox and network — request the right mode up front

- **Network-requiring commands must set `requestAllowNetwork` in the same call
  that runs them.** This includes: `pnpm install/remove/up` (registry access),
  `git push`/`git fetch`/`git pull`, `curl`/`wget`. A sandboxed network
  failure looks like a generic fetch error — don't debug it, re-run with the
  flag.

- **Unsandboxed execution is granted on demand, not requested speculatively.**
  The harness auto-escalates when sandbox-blocked output is detected
  (recorded as `sandboxedExecution: false` with reason "The sandboxed
  execution output indicated the sandbox blocked the command"). Prefer
  absolute paths over requesting unsandboxed mode.

- **Node, pnpm, and vite-plus live under `$HOME/.vite-plus` and
  `$HOME/.local/share/pnpm`.** Sandboxed terminals may not see these paths.
  If a command fails with "command not found" or node-resolution errors,
  use the absolute path under `~/.vite-plus/bin/` rather than improvising
  PATH workarounds.

- **The sandbox filesystem view is path-scoped.** Three spaces are shared
  between sandboxed and unsandboxed calls: the workspace, `/tmp`, and
  `$TMPDIR` (plus tool-cache paths). Everything else (e.g. `~/projects/`
  root, sibling repos, `$HOME` dotfiles) appears empty or missing from a
  sandboxed call even though it exists on the real filesystem. To read or
  verify state outside the shared spaces, request unsandboxed execution
  with a reason — do not conclude files are missing from a sandboxed `ls`.

- **`/tmp` is the safe scratch space for either execution mode.** Unlike
  `~/projects` and `$HOME`, it is NOT masked by the sandbox: sandboxed
  reads AND writes to `/tmp` hit the real filesystem and persist across
  calls. Use it for test fixtures, benchmarks, and backups. Caveat: it is
  still `/tmp` — cleared on reboot, not long-term storage.

- **`$TMPDIR` is not `/tmp`.** In this harness `$TMPDIR` resolves to a
  per-session VS Code dir (`~/.vscode-server/tmp/tmp_vscode_1`) containing
  harness plumbing (e.g. sandbox-settings JSON). It is also
  sandbox-visible and writable, but it is session-scoped plumbing — use
  `/tmp` for anything you want to find again later in the same machine
  session.

- **Writes from a sandboxed terminal to paths outside the workspace may
  land in ephemeral storage and silently vanish.** If a file you just
  created is "gone" on the next call, suspect this — the write went to
  sandbox tmpfs, not disk. Verify with an unsandboxed read, or ask the
  user to run the command.

- **Decide the execution mode BEFORE running, and request it explicitly on
  every call** (with a reason). The primary decision procedure: if the
  command touches paths outside the shared spaces (workspace, `/tmp`,
  `$TMPDIR`) or needs network, request unsandboxed / `requestAllowNetwork`
  in that same call. Auto-escalation by the harness exists but is a
  fallback, not a strategy — assuming it will catch you leads to long
  chains of commands silently running sandboxed against masked paths,
  producing empty/garbage results that then get misdiagnosed. If results
  look wrong, first check which mode actually ran before retrying.

## 3. Retry discipline — never burn runs on a deterministic failure

- **Distinguish deterministic failures from timing issues before retrying.**
  A command that fails instantly and identically every time (exit 127, exit 2
  with the same message) is not slow to start. Retrying with a longer timeout
  is pointless. Diagnose after the FIRST occurrence.

- **After one `command not found`, switch to the known-good pattern** — do
  not try another PATH variant. Empirical cost of violating this: ~4 wasted
  tool runs in a single session.

- **When a standard tool call fails unexpectedly, stop and explain the
  failure to the user before retrying.** Never launch into extended
  troubleshooting of basic tooling that should just work.

- **After 2–3 failed attempts at the same fix, stop.** Write a short state
  summary (what was tried, current hypothesis) and check in with the user.

- **When an investigation has a finite, enumerable search space, write the
  enumeration script FIRST** and run it once, instead of issuing exploratory
  commands one at a time. Identical results must terminate the search, not
  trigger a re-run.

- **Identical results — not just identical errors — must terminate retries.**
  A command that exits 0 but returns the same "not found"/empty output every
  time is a deterministic result; re-running it unchanged is the same waste
  as retrying a failed command. (Observed cost: ~10 identical `ls` calls in
  one session before this rule was learned.)

- **If the user reports seeing files or state that your terminal does not
  show, suspect a sandbox visibility gap and switch execution mode**
  (request unsandboxed) rather than re-running the same command. The user's
  terminal and the sandbox can see different filesystems.

- **Do not write scripts against directory layouts you cannot see.** Get a
  real listing first (unsandboxed run, or pasted from the user) — a guessed
  glob produced a broken sync script that the user had to fix.

## 4. Long-running and interactive commands

- **Watch-mode scripts (`vpr devtest`) and dev servers must run as background
  tasks**, never as blocking terminal commands. Blocking on them hangs the
  terminal and invites retry loops.

- **Set `CI=true` (or the non-interactive flag) for all package-manager
  tooling.** Commands that may trigger interactive prompts (Corepack version
  downloads, pnpm confirmations) hang silently.

## 5. GitHub CLI

- **`gh` is not authenticated in agent terminals.** If a `gh` command fails
  with an auth prompt or "To get started with GitHub CLI" error, do not retry
  or work around it — ask the user to run the command or paste the output.

## 6. Commits

- **Commit messages follow Conventional Commits** (`feat:`, `fix:`,
  `chore:`, `docs:`, ...). Draft commit messages when asked, but do not
  commit unless the user explicitly asks for it.

## 7. Forensics — where session/execution data actually lives

When asked to audit what an agent did (exit codes, sandbox mode, network
access), check locations in this order:

1. **Windows host UI side** (authoritative, complete):
   `/mnt/c/Users/<user>/AppData/Roaming/Code/User/workspaceStorage/<ws-hash>/chatSessions/<session-id>.jsonl`
   — per-command `exitCode`, `requestUnsandboxedExecution`,
   `requestAllowNetwork`, `sandboxedExecution` (+ reason), `commandLine`,
   timestamps. This is what the SESSIONS panel renders.
2. **WSL server-side transcript**
   (`~/.vscode-server/data/User/workspaceStorage/<ws-hash>/GitHub.copilot-chat/transcripts/<id>.jsonl`)
   — conversation events only. `tool.execution_complete` carries ONLY
   `{toolCallId, success}`; `success: true` means the tool call returned, NOT
   that the command exited 0. No exit codes, no sandbox flags.
3. **Server-side debug logs** (`GitHub.copilot-chat/debug-logs/<id>/`) —
   telemetry spans only (`session_start`); request/response bodies are not
   written here. Sessions whose debug log never populates are permanently
   invisible to session indexing (`/chronicle`), even after force reindex.
   If the server-side debug log is empty for a session, skip directly to the
   Windows host side — the server-side pipeline may have failed entirely for
   that session, and the UI-side JSONL is the only complete record.

## 8. Validation loop

- Run `vp install` after pulling remote changes and before getting started.
- Run `vp check` and `vp test` to format, lint, type check and test changes.
- Check for `vite.config.ts` tasks or `package.json` scripts needed for
  validation; run via `vpr <script>`.
- If setup, runtime, or package-manager behavior looks wrong, run
  `vp env doctor` and include its output when asking for help.

## 9. Lint verification and autofix (Vite+/Oxlint projects)

- **Per-file lint checks must use `vp lint <file>` (the built-in), never
  `vpr lint <file>`.** `vpr lint` runs the npm script, which is typically
  `vp lint . --max-warnings 0 ...` — the `.` lints the whole project and the
  trailing path argument is effectively ignored. Verifying a single file's
  cleanliness through `vpr lint <file>` can report 0 findings while the file
  still has errors (observed: 39 real `sort-objects` errors invisible via
  `vpr lint <file>` but shown by `vp lint <file>` and the VS Code Problems
  panel). The Problems panel mirrors `vp lint`, so when editor and CLI
  disagree, check which command the CLI actually ran.

- **`--fix-suggestions` is not idempotent and does not converge in one
  pass.** Re-sorting one object can expose new violations. Loop until the
  error count reaches 0, checking with the same command that reports the
  errors:

  ```sh
  until vp lint <file> 2>&1 | grep -q 'error'; do
    vp lint --fix-suggestions <file> || break
  done
  ```

  Observed: 39 errors needed 2+ passes; a single pass left 16. Review the
  resulting diff — suggestion fixes can move comment-attached lines.

- **`vp lint --fix` only applies safe fixes; `--fix-suggestions` applies
  suggestion-level fixes** (e.g. `perfectionist/sort-objects`), which oxlint
  documents as "may change program behavior". Sort rules are safe for plain
  object literals but always eyeball the diff.

## 10. Meta-rules — editing and propagating THIS file

This file is a distributed copy managed by `~/projects/sync-agent-rules.sh`
(itself Stow-installed from the wsl-ubuntu-config-private repo). The
workflows:

- **To edit the rules:** run
  `~/projects/sync-agent-rules.sh --begin <repo-path>` from the repo you
  want to edit in. It verifies no lock is held, the worktree is clean, and
  the repo copy matches central (footer-stripped) — refusing with backups
  on divergence. **The clean-worktree check means any uncommitted edits to
  the repo copy must be stashed (or committed) before `--begin` will
  start** — stash first, run `--begin`, then re-apply the stash and edit.
  Then run `~/projects/sync-agent-rules.sh --finish` to promote the edit to
  central, re-stamp, and propagate to all other repos. It prints (does not
  run) the commit command for the editing repo.
- **To pull without editing:** run `~/projects/sync-agent-rules.sh` (plain
  sync) or `--check` for drift-only. `--adopt` offers to add the file to
  repos that have agent instructions but no copy yet.
- **Use `--check` to determine current status before acting.** It reports
  drift only (no writes), listing repos whose copy differs from central —
  e.g. `DRIFT: coding-challenges-in-ts` means that repo's copy has
  un-promoted edits (or is otherwise out of sync). Run it first to decide
  whether you need `--begin`/`--finish` (promoting an edit) or a plain sync
  (pulling central out).
- **Footers are script-managed.** The last line of every copy is a stamp
  (`last-edit=` on central, `synced=` on distributed). Never hand-edit it;
  drift comparison strips it, so stamped copies don't look perpetually
  drifted.
- **Locks:** a central directory lock (`~/projects/.agent-terminal-rules.lock`)
  prevents concurrent edits. A stale lock (>24h) can be stolen with
  `--force`. Never delete the lock manually while an edit session is live.
- **Sandbox note for editors:** the central file lives at `~/projects/`,
  outside the shared sandbox spaces — all sync-script invocations and any
  direct central-file access need unsandboxed execution. Editing the repo
  copy can be done with the VS Code edit tool (it sees the real
  filesystem).

<!-- agent-terminal-rules: synced=2026-08-31T01:58:29Z src=3f9c6658 -->
