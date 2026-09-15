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
> forensics from the coding-challenges-in-ts repo (2026-08 → 2026-09-15).
>
> **2026-09-15 major revision.** The previously documented "warm-up" pattern
> was **retracted** — see §1. It was an artifact of silent sandbox
> auto-escalation, not a real mechanism. The sandbox model below is verified
> against the harness source (`@vscode/sandbox-runtime`) and the host-side
> session JSONL.

## 1. Command invocation — get it right the first time

> **Prerequisite (user-side, one-time per machine):** the terminal sandbox
> must be allowed to read the toolchain. In VS Code settings:
>
> ```jsonc
> "chat.agent.sandbox.fileSystem.linux": {
>   "denyRead": [],
>   "allowRead": ["~/.vite-plus/"],
>   "allowWrite": [],
>   "denyWrite": []
> }
> ```
>
> Verified working 2026-09-15. Notes: (a) paths are **literal only** — no
> globs (the sandbox silently drops glob patterns on Linux); (b) the sandbox
> resolves **real paths post-symlink**, so scoping to `~/.vite-plus/bin/`
> alone fails — every shim there is a symlink into `current/` → `0.3.1/`,
> and the whole `~/.vite-plus/` entry is the minimal correct scope;
> (c) `github.copilot.chat.additionalReadAccessPaths` grants read access to
> the _agent tools_ (read_file/grep) only — it does NOT affect the terminal
> sandbox.

- **Vite+ wraps the package manager, never the reverse.** Run project scripts
  with `vpr <script>` (e.g. `vpr test`, `vpr lint:knip`). Never `pnpm run` or
  `pnpm exec vp` — pnpm's script environment prepends `node_modules/.bin` to
  PATH, which breaks vp's node resolution
  (`error: Cannot find binary path for command 'node'`).

- **Canonical invocation forms (verified fully sandboxed 2026-09-15, zero
  escalations):**

  ```sh
  # absolute paths — no prefix needed:
  "$HOME/.vite-plus/bin/vpr" <script>
  "$HOME/.vite-plus/bin/vp" <cmd>
  "$HOME/.vite-plus/bin/node" --version          # vp-managed node

  # bare names — one inline PATH prefix:
  PATH="$HOME/.vite-plus/bin:$PATH" CI=true vpr <script>
  PATH="$HOME/.vite-plus/bin:$PATH" CI=true pnpm <cmd>
  ```

  Bare names without the prefix fail with exit 127 (not on the sandbox
  PATH). `CI=true` prevents silent hangs on interactive prompts.

- **⚠ RETRACTED: the "warm-up" pattern (2026-09-10 → 2026-09-15).** Earlier
  revisions of this file documented a `find ... -name vp` prefix that
  "unblocked" vp execution. Session forensics (host-side JSONL, §7) proved
  every such "success" was the harness **auto-escalating to unsandboxed
  execution** after a user approval prompt — the agent never saw the
  difference. There is no warm-up mechanism; the failures were genuine
  sandbox path-masking, and the fix is the settings change above, not a
  command prefix. Lesson recorded in §2: verify which mode actually ran
  before building a theory on "it works now".

- **`pnpm` build-script approvals are declared, not interactive (2026-09-03).**
  `pnpm approve-builds` is interactive and hangs in agent terminals.
  Declare the build in `pnpm-workspace.yaml` instead:
  `allowBuilds: { <dep>: true }`, then re-run `pnpm install`. Also:
  `CI=true pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` once any
  dep declares a build script that isn't in `allowBuilds` — the fix is
  the yaml edit, never the interactive prompt. **Workspace globs live in
  `pnpm-workspace.yaml` too: pnpm ignores the npm `workspaces` field of
  root package.json once that file exists** — missing `packages:` there
  silently unlinks all packages (`pnpm -r list` shows only the root;
  `--filter` matches nothing). Check `pnpm -r list` after any
  workspace-file edit.

- **"command not found" does not mean absent.** The sandbox PATH simply
  doesn't include `~/.vite-plus/bin`. Use the canonical forms above before
  concluding a tool is missing.

## 2. Sandbox and network — how it actually works

- **The sandbox is bubblewrap (`bwrap`) + `socat`, driven by
  `@vscode/sandbox-runtime`.** Each `run_in_terminal` call is wrapped as
  `env TMPDIR=... /bin/bash -c 'cd <ws> && <cmd>'` inside a
  `sandbox-runtime cli.js` process tree. `cli.js` loads a per-call settings
  JSON; `sandbox-manager.js` builds the policy (and silently strips glob
  patterns on Linux); `linux-sandbox-utils.js` probes `bwrap`/`socat` with
  `whichSync`, spawns socat bridges for filtered network, and wraps the
  command in `bwrap --new-session --die-with-parent` with ro-binds for each
  allowed path plus a seccomp filter (unix-socket blocking). WSL1 is not
  supported (WSL2 required for full enforcement).

- **Sandbox-visible filesystem (verified 2026-09-15):** the workspace,
  `$HOME/.vscode-server/`, `$TMPDIR`, and anything added via
  `chat.agent.sandbox.fileSystem.linux.allowRead`. Everything else under
  `$HOME` (including `~/.vite-plus` without the settings change, and
  `~/.local/share/pnpm`) is **masked** — `ls`/`stat`/`exec` all return
  ENOENT. Do not conclude files are missing from a sandboxed `ls`.

- **`/tmp` is READ-ONLY in the sandbox (corrected 2026-09-15).** Earlier
  revisions called `/tmp` the safe scratch space — that observation was
  also escalation-confounded. Verified sandboxed behavior: writes to `/tmp`
  fail with `Read-only file system`. Use the workspace (e.g. a
  `.vscode-scratch/` dir) for scratch files; it is writable and persists.

- **Network-requiring commands must set `requestAllowNetwork` in the same
  call that runs them.** This includes: `pnpm install/remove/up` (registry
  access), `git push`/`git fetch`/`git pull`, `curl`/`wget`. A sandboxed
  network failure looks like a generic fetch error — don't debug it, re-run
  with the flag.

- **Auto-escalation is invisible to the agent — never build on it.** When a
  sandboxed command's output looks sandbox-blocked, the harness may re-run
  it unsandboxed after a user approval prompt. The agent receives only the
  final result with no indication the mode changed. Session-forensics
  signature of an escalation: the host-side JSONL (§7) contains a _pair_ of
  records for the same `commandLine` — first
  `requestUnsandboxedExecution=false`, then `=true`. 16 such pairs were
  found in one session (2026-09-15) and every "warm-up success" traced to
  one. Rules: (1) request unsandboxed explicitly (with a reason) when a
  command genuinely needs it, so the mode is deterministic and visible;

> (2) if a previously-failing command suddenly succeeds, check the JSONL
> for an escalation pair before crediting any code change; (3) treat
> user-reported approval prompts as a signal to re-examine which mode ran.

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

- **Pipe vp progress commands to `cat` in agent terminals (verified
  2026-09-07, chat-hub).** `vp staged` / `vp check` render an animated
  spinner of high-frequency ANSI cursor rewrites. In the agent harness that
  stream is captured by the VS Code Remote extension host, serialized to
  the chat panel's live tool display, and repainted by the Windows Electron
  process — which pegs the Windows host CPU and throttles Hyper-V vCPU
  allocation to the WSL2 VM. Measured on one machine: `vp staged` takes
  35–60s with the spinner, **10–14s with `| cat`** (same milestone output,
  no animation). `CI=true` and `TERM=dumb` do NOT suppress it (spinner still
  renders); only breaking the TTY does. Rule:

  ```sh
  "$HOME/.vite-plus/bin/vp" staged | cat
  "$HOME/.vite-plus/bin/vp" check | cat
  ```

  (`>/dev/null` is equally fast but loses all progress output — `| cat`
  preserves the milestone lines users want to see.)

## 5. GitHub CLI

- **`gh` is not authenticated in agent terminals.** If a `gh` command fails
  with an auth prompt or "To get started with GitHub CLI" error, do not retry
  or work around it — ask the user to run the command or paste the output.

## 6. Commits

- **Commit messages follow Conventional Commits** (`feat:`, `fix:`,
  `chore:`, `docs:`, ...). Draft commit messages when asked, but do not
  commit unless the user explicitly asks for it.

- **Signed commits: the GPG passphrase must come from the user (first
  commit only).** gpg-agent caches it afterward — subsequent commits in
  the session go through without prompting. If the first commit fails
  with an identity/passphrase error, hand the commit to the user rather
  than retrying. Also: "Committer identity unknown" in a sandboxed
  terminal is often the `$HOME` visibility gap — an `ls ~/.gitconfig.common`
  immediately before the commit has resolved it (then set repo-local
  `git config user.name/user.email` from that file's values).

- **Pre-commit hooks that invoke vp fail in sandboxed terminals
  (verified 2026-09-03, chat-hub).** The vite+ hook dispatcher runs
  `node_modules/.bin/vp`, whose shim guards with `[ -x "$basedir/node" ]`.
  Under the sandbox's seccomp layer that test returns false for files
  hardlinked into the pnpm store (outside the workspace), so the shim
  falls through to bare `node` → exit 127 → hook fails → commit blocked.
  The same commit succeeds unsandboxed. **Rule: any `git commit` in a
  repo with a vp-based pre-commit hook must run unsandboxed** (request
  it with a reason up front — don't burn a sandboxed attempt first).
  In the user's own terminal this never occurs (no seccomp layer, full
  PATH). Diagnostic signature: hook output shows the audit script
  passing, then `./node_modules/.bin/vp: 53: exec: node: not found`.

- **vp hook scripts are re-executed by `/bin/sh -e` regardless of their
  shebang (verified 2026-09-07, chat-hub).** The vite+ dispatcher
  (`.vite-hooks/_/h`) runs each hook script as `"$__vp_shell" -e "$s"`
  with `__vp_shell=/bin/sh` — so a `#!/usr/bin/env bash` shebang in
  `.vite-hooks/pre-commit` is decorative, and bash-only syntax fails:
  `set -o pipefail` → `Illegal option -o pipefail` (dash is the /bin/sh
  on Ubuntu). Write hook scripts in POSIX sh. To get pipefail semantics
  across a pipeline, capture the status explicitly:

  ```sh
  vp staged | cat          # suppresses the spinner (see §4) in hook context
  status=$?
  [ $status -ne 0 ] && exit $status
  ```

- **Multi-session stale-buffer hazard (verified 2026-09-07, chat-hub).**
  When two agent sessions (or a session + the user's editor) hold the
  same file in context, one session can apply a pre-commit-state buffer
  over already-committed changes — rolling the file back on disk (a
  225-line rollback was caught this way; it also broke the build because
  committed exports disappeared). Rules: (1) never `git restore` a
  suspected rollback — `git stash push -m "<description>" <file>`
  preserves it for forensics; (2) after accepting cross-session edits,
  sanity-check `git diff --stat` before staging (a rollback shows as a
  large deletion against recent commits); (3) verify recovery with the
  repo's build + typecheck; (4) close/reload editor tabs in stale
  sessions so they re-read the current file.

## 7. Forensics — where session/execution data actually lives

When asked to audit what an agent did (exit codes, sandbox mode, network
access), check locations in this order:

1. **Windows host UI side** (authoritative, complete):
   `/mnt/c/Users/<user>/AppData/Roaming/Code/User/workspaceStorage/<ws-hash>/chatSessions/<session-id>.jsonl`
   — per-command `requestUnsandboxedExecution`, `requestAllowNetwork`,
   `commandLine`, timestamps. **Escalation signature:** a _pair_ of records
   with the same `commandLine` — first `requestUnsandboxedExecution=false`,
   then `=true` (see §2). Note (2026-09-15): in the current VS Code build
   the `exitCode`/`sandboxedExecution` fields were not found at their
   documented paths in the JSONL — schema may have drifted; the
   `requestUnsandboxedExecution` pairing remains reliable. Note the WSL
   username can differ from the login name (observed: `jonat` vs
   `jonathan`).
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
  outside the sandbox-visible filesystem — sync-script invocations and any
  direct central-file access need unsandboxed execution (request it
  explicitly with a reason). Editing the repo copy can be done with the
  VS Code edit tool (it sees the real filesystem).

<!-- agent-terminal-rules: synced=2026-09-08T07:02:20Z src=7f3d305f -->
<!-- agent-terminal-rules: synced=2026-09-06T08:11:11Z src=c4a224aa -->
<!-- agent-terminal-rules: synced=2026-09-03T16:27:44Z src=c4a224aa -->
