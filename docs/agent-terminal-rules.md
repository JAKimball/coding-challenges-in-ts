# Agent Terminal Rules (Vite+ / pnpm / WSL / VS Code agent harness)

> **⚠ This file is a distributed copy.** The source of truth lives at
> `~/projects/agent-terminal-rules.md`. After editing the central file, run
> the sync script to propagate to all repos:
>
> ```sh
> ~/projects/sync-agent-rules.sh
> ```
>
> If you are editing *this* copy, copy your changes back to the central file
> first, then sync — otherwise the next sync will silently overwrite them.
> (Note: agents in sandboxed terminals cannot see or write the central file
> at `~/projects/` — hand the edit to the user, or apply it in the repo copy
> and ask the user to copy it back before syncing.)

<!-- -->

> Facts-only edition (2026-11-02, decision 0009). Portable facts for AI
> coding agents working in this environment (Vite+ / pnpm / WSL / VS Code
> agent harness). This file keeps the environment model,
> enforcement-layer facts, and canonical cross-cutting guardrails.
> **Procedures and task-scoped rules live in the agent skills; the why
> (evidence, measurements, incident history) lives in
> `docs/agent-terminal-rationale.md`.** Every fact is empirically
> verified.

## Where things moved (2026-11-02 split)

- §1 invocation forms + pnpm/workspace procedures → `pnpm-vite` skill
  (§1–§2)
- §4 long-running/interactive commands → `pnpm-vite` skill (§3)
- §8 validation loop, §9 lint verification → `pnpm-vite` skill (§4–§5)
- §6 commit procedure + task rules → `git-commit` skill
- §7/§7.1 forensics locations + audit procedure → `session-forensics`
  skill
- Revision history, evidence, measurements, incident lore →
  `docs/agent-terminal-rationale.md`

Retained section numbers are stable — gaps are where sections moved out.

## 1. Command invocation — facts

> **Prerequisite (user-side, one-time per machine):** the terminal sandbox
> must be allowed to read the toolchain. In VS Code settings:
>
> ```jsonc
> "chat.agent.sandbox.fileSystem.linux": {
>   "denyRead": [],
>   "allowRead": ["~/.local/share/vite-plus/"],
>   "allowWrite": [],
>   "denyWrite": []
> }
> ```
>
> Verified working 2026-09-15; updated 2026-10-25 for the Vite+ v1.4.0
> split layout. Notes: (a) paths are **literal only** — no globs (the
> sandbox silently drops glob patterns on Linux); (b) the sandbox resolves
> **real paths post-symlink**, so scoping to `~/.local/share/vite-plus/bin/`
> alone fails — every shim there is a symlink into `current/` → `1.4.0/`,
> and the whole `~/.local/share/vite-plus/` entry is the minimal correct
> scope; (c) `github.copilot.chat.additionalReadAccessPaths` grants read
> access to the *agent tools* (read_file/grep) only — it does NOT affect
> the terminal sandbox. (d) **Individual files are valid allowRead entries
> (verified 2026-10-01):** `~/.gitconfig` and `~/.gitconfig.common` were
> added and the git include chain resolves sandboxed — see §6. (e)
> **Windows-side paths under `/mnt/c` are valid allowRead entries (verified
> 2026-10-07):** `/mnt/c/Users/<user>/AppData/Roaming/Code/User/` was added
> and sandboxed `ls`/`grep` against the Windows-side settings and
> chatSessions JSONL succeed without escalation — see §2 for the
> verification caveat.

- **Invocation forms** (canonical `vpr`/`vp`/bare-name/PATH-prefix
  forms, `CI=true` discipline) → `pnpm-vite` skill §1. Facts: Vite+
  wraps the package manager, never the reverse (`pnpm run` / `pnpm exec
  vp` breaks vp's node resolution); bare names without the PATH prefix
  fail with exit 127.
- **"command not found" does not mean absent.** The sandbox PATH simply
  doesn't include `~/.local/share/vite-plus/bin` — use the skill's
  canonical forms before concluding a tool is missing.
- **Node runtime resolution** (vp shim resolves the runtime from the
  nearest `devEngines` pin, falls back to current LTS; over
  non-interactive ssh the shim dir is not on PATH) → `pnpm-vite` skill
  §1.
- **The "warm-up" pattern was RETRACTED (2026-09-15).** There is no
  warm-up mechanism — the old `find ... -name vp` "fix" was an artifact
  of silent sandbox auto-escalation. Evidence:
  `docs/agent-terminal-rationale.md`.
- **pnpm build approvals are declared, not interactive; workspace globs
  live in `pnpm-workspace.yaml` too** → `pnpm-vite` skill §2.

- **Never put raw control characters in tool-call payloads (learned
  2026-10-30 — HARD RULE).** A raw Ctrl-C (U+0003) is illegal in XML and
  JSON; when one decodes into a tool payload it breaks the framing,
  content leaks across channels, and the context is spammed with noise
  (a session had to be rolled back). To stop a background process use:
  (1) a finite `durationMs`/timeout so it self-terminates, (2) `kill
  <pid>` (SIGTERM — most tools print their summary on SIGTERM too),
  (3) `tmux kill-session -t <name>`, or (4) the `killTerminal` tool.
  Never "send Ctrl+C", even when a program's banner says "Ctrl+C for
  summary".

- **Never trust invisible characters in generated payload files
  (learned 2026-11-01 — same class as the HARD RULE above).** Zero-width
  spaces (U+200B), BOMs, and similar invisibles are legal in tool-call
  text and silently corrupt machine-read files: a `git filter-repo
  --replace-text` file generated twice in a row both times carried
  U+200B after `==>`, which would have injected zero-width spaces into
  every rewritten blob. When a file is consumed by a tool (replacement
  lists, configs, fixtures), verify it **byte-exactly** (`python3 -c
  "open(f,'rb').read().decode('ascii')"` or `od -c`) before use, and
  scan outputs for the same class (`grep -P '[\x{200b}-\x{200f}\x{feff}]'`).

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
  supported (WSL2 required for full enforcement). Runtime sources (seccomp
  policy, bwrap arg assembly):
  `~/.vscode-server/bin/<rev>/node_modules/@vscode/sandbox-runtime/`.

- **Seccomp blocks only `socket(AF_UNIX, …)` (+ io_uring syscalls); TCP
  is free (verified 2026-10-25).** Policy source:
  `@vscode/sandbox-runtime` `vendor/seccomp-src/seccomp-unix-block.c`.
  The escape hatch `chat.agent.sandbox.advanced.runtime:
  {"network":{"allowAllUnixSockets":true}}` disables the block
  entirely — rejected 2026-10-25 (all-or-nothing security trade-off;
  revisit only if a Unix-socket bridge becomes burdensome).

- **Each sandboxed command gets its own PID namespace** (`--unshare-pid`
  per invocation) — cross-call `kill -0` is meaningless; probe liveness
  over the shared network namespace (`/dev/tcp/127.0.0.1:<port>`) or
  the filesystem. The network namespace IS shared while
  `network.enabled: false` — localhost TCP works, which is what makes
  a sandboxed TCP/FIFO relay possible (verified 2026-10-25).

- **Sandboxed `ssh` cannot persist host keys — use explicit options
  (learned 2026-11-01).** The sandbox blocks writes to
  `~/.ssh/known_hosts`, so `StrictHostKeyChecking=accept-new` silently
  fails to record the key and the *next* call dies with "Host key
  verification failed". For scripted SSH from agent terminals use
  `-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`
  (acceptable for short-lived probes to known hosts), or pre-seed
  `known_hosts` in a user terminal and accept the TOFU once.

- **WSL interop uses per-PID sockets under `/run/WSL/<pid>_interop`** —
  interop access cannot be path-allowlisted; any Windows `.exe` launch
  must run unsandboxed (verified 2026-10-25).

- **Sandbox-visible filesystem (verified 2026-09-15):** the workspace,
  `$HOME/.vscode-server/`, `$TMPDIR`, and anything added via
  `chat.agent.sandbox.fileSystem.linux.allowRead`. Everything else under
  `$HOME` (including `~/.local/share/vite-plus` without the settings
  change, and `~/.local/share/pnpm`) is **masked** —
  `ls`/`stat`/`exec` all return ENOENT. Do not conclude files are missing
  from a sandboxed `ls`.
  `/mnt/c` is denyRead/denyWrite by user settings since 2026-10-01;
  per-session approval is the user's preference (Windows-side access via
  `c:` URI schemes may bypass the linux-sandbox setting). Exception
  (verified 2026-10-07): `/mnt/c/Users/<user>/AppData/Roaming/Code/User/`
  is in allowRead — sandboxed reads of Windows-side settings and the
  host-side chatSessions JSONL (`session-forensics` skill) work without
  escalation. **Caveat:
  an allowRead change takes effect mid-session without reload, but early
  post-change "successes" may still be escalation pairs from before the
  setting landed — audit the JSONL (`session-forensics` skill) and credit
  the setting only on
  a single `=false` record with no `=true` twin.**

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

- **Sandboxed writes outside the workspace land in ephemeral storage and
  silently vanish (verified 2026-10-05).** A hook installer writing to
  `~/.copilot/hooks/` reported success, but the files were gone on the
  next unsandboxed read. Any script that deploys to `$HOME` (hook
  installers, config updates, dotfile edits) must run unsandboxed —
  request it with a reason BEFORE running, not after a silent loss.
  Verify deployments with an unsandboxed read. This rule is about the
  SANDBOXED TERMINAL layer; file-tool writes (`create_file` etc.) are a
  different layer with different durability rules — see §11.

- **Auto-escalation is invisible to the agent — never build on it.** When a
  sandboxed command's output looks sandbox-blocked, the harness may re-run
  it unsandboxed after a user approval prompt. The agent receives only the
  final result with no indication the mode changed. Session-forensics
  signature of an escalation: the host-side JSONL (`session-forensics`
  skill) contains a *pair* of
  records for the same `commandLine` — first
  `requestUnsandboxedExecution=false`, then `=true`. 16 such pairs were
  found in one session (2026-09-15) and every "warm-up success" traced to
  one. Rules: (1) request unsandboxed explicitly (with a reason) when a
  command genuinely needs it, so the mode is deterministic and visible;

> (2) if a previously-failing command suddenly succeeds, check the JSONL
> for an escalation pair before crediting any code change; (3) treat
> user-reported approval prompts as a signal to re-examine which mode ran.

- **Output-content escalation false positive (verified 2026-10-01,
  session `898c9328`; re-verified 2026-10-28 — still active).** The
  escalation heuristic inspects the command
  **output**, not just the command line or exit code — and it escalates
  even when the command **exited 0**. Every escalated record in the
  audited session carried
  `requestUnsandboxedExecutionReason = "The sandboxed execution output
  indicated the sandbox blocked the command."` while its captured output
  contained the literal strings `ENOENT` and `Auto-escalation` — quoted
  from THIS documentation by `git diff` of AGENTS.md files. Self-
  referential trap: any command whose output *documents* the sandbox
  (diff/grep/cat of the rules docs, bug reports quoting them) matches
  the signature. The harness's own sandbox-advisory boilerplate appended
  to tool results feeds the heuristic more matching text. Workarounds:
  (1) mask signature strings in output
  (`sed 's/ENOENT/E-NOENT/g'`) when inspecting sandbox-related docs;
  (2) write output to a file and read it with the file tool instead of
  the terminal; (3) request unsandboxed explicitly for multi-repo
  command batches so the mode is deterministic and visible; (4) read
  documentation with the file tools (`read_file`) — the file-tool
  layer has no output heuristic. Prefer
  `git -C <path>` over cross-folder `cd` chains (weak evidence, see
  §3).

- **Repo-location fact (where things are NOT).** The workspace folder
  is not the only repo: dev repos live under `~/projects/` (WSL home,
  sandbox-masked from other workspaces) and some under
  `/mnt/c/Users/jonat/projects/` (Windows side). Cross-repo reads need
  unsandboxed execution or a second workspace root.

- **Harness output compression (EXPERIMENTAL — re-verify before relying
  on it).** Long command output (e.g. `git diff`) can be truncated with
  an "unchanged context lines omitted" marker; redirect output to a
  workspace scratch file and read the file instead. Open questions:
  which tools compress, the size threshold, whether omitted content is
  recoverable, and interaction with diff-review workflows.

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

- **Heredoc `!` escaping trap (verified 2026-10-05).** The harness
  escapes `!` as `\!` (bash history-expansion protection) when
  transmitting commands; inside a quoted heredoc (`<< 'EOF'`) the
  backslash arrives literally → Python
  `SyntaxError: unexpected character after line continuation character`.
  Deterministic — no retry variant fixes it. Fixes: write the script
  with the file-creation tool (never heredoc), avoid `!` in the code
  (`if not (x == y): continue`), or bake
  `sed -i 's/\\!/!/'` into the same command.

- **Near-identical retries are themselves a loop.** Re-issuing a failing
  heredoc under new filenames (`script12.py` → `script13.py`) ~10 times
  is the same failure with cosmetic variation. The loop-guard hook
  normalizes digit-bearing tokens in its signature (same-loop-new-
  filename is caught: warn → deny → circuit breaker) — but the rule
  stands: when the only change between retries is a filename, counter,
  or counter-bearing token, stop and diagnose.

- **Do not write scripts against directory layouts you cannot see.** Get a
  real listing first (unsandboxed run, or pasted from the user) — a guessed
  glob produced a broken sync script that the user had to fix.

- **The unsandboxed rule is PATH-based, not operation-based (JSONL-audited
  2026-09-29, session `93544b5f`).** 662 command records: 71 explicitly
  unsandboxed, 70 escalation pairs, 594 involving `~/.copilot/` paths —
  every pair = one wasted sandboxed attempt + one user approval. Read-only
  `ls`/`head`/`cat` fail in the sandbox just like writes when the path is
  masked. **Rule: request unsandboxed UP FRONT for ANY command touching
  `$HOME` outside {workspace, `~/.vscode-server/`, `$TMPDIR`, allowRead}**
  — and batch such operations into one call instead of sandbox-first
  probing.

- **Escalation-confounded "intermittent" observations are the most
  dangerous retry-loop trigger (session `93544b5f`).** A ~25-call
  identical `cat|diff` loop was entirely escalation pairs — each
  "failure" a sandboxed ENOENT, each rare "success" the unsandboxed
  re-run after user approval. From inside, this looked like intermittent
  visibility; the JSONL showed alternating modes. The occasional success
  masquerades as new information. Root cause: a model that doesn't fully
  understand sandbox behavior assumes non-determinism where results are
  deterministic — the wrong model directly manufactures retries and
  loops. Audit the JSONL (`session-forensics` skill); never retry-loop.

- **Subagent retry-loop hazard (verified 2026-10-01).** A subagent given
  a non-matching glob re-issued the identical failing search 43+ times
  until harness termination, returning "completed with no output". For
  multi-root subagent tasks: verify the glob matches the actual layout
  before delegating, scope globs per workspace folder correctly, or
  survey in the main session where course correction is possible.

## 4. Long-running and interactive commands — moved

→ `pnpm-vite` skill §3: background-task discipline, `CI=true`, the
spinner/`| cat` throttle (with measurements), the `vp fmt` foot-gun
(use `vp check --fix` for staged config), and hook-output rules.

## 5. GitHub CLI

- **`gh` is not authenticated in agent terminals.** If a `gh` command fails
  with an auth prompt or "To get started with GitHub CLI" error, do not retry
  or work around it — ask the user to run the command or paste the output.

## 6. Commits — identity and signing facts

Procedure and task rules live in the `git-commit` skill (commit only
when the user explicitly asks; unsandboxed commit; `-m` flags; one
commit per call; GPG prompt handling; verification steps; hook
authoring).

- **Identity resolution works sandboxed** (updated 2026-10-01) when
  `~/.gitconfig` and `~/.gitconfig.common` are in `allowRead` (§1): the
  include chain resolves and `commit.gpgsign`/`user.signingkey`/
  identity all come from the global config — the old "empty ident → run
  unsandboxed / set repo-local identity" advice is superseded. Global
  git config is the single source of truth: repo-local identity/signing
  overrides shadow the chain and drift on key rotation — remove them.

- **Signing gotcha: relative include paths break silently.**
  `~/.gitconfig` includes `./.gitconfig.common` relatively; when the
  target is masked, the include chain breaks with NO error and commits
  go out unsigned. Rules: after any allowRead change, verify with
  `git config --get commit.gpgsign` sandboxed; after any commit, verify
  `git log -1 --format='%G?'` = G (a silent break shows as N).

- **GPG passphrase caching is TTL-limited**, not session-long: the
  first commit of a day (or after a long gap) prompts in the alternate
  buffer — the user's passphrase only. Why the environment is like
  this: `docs/agent-terminal-rationale.md` (commit incidents: heredoc
  aborts, the sweep failure mode, stale-buffer rollbacks, format-on-
  save drift).

## 7. Forensics — stub

Session/execution data locations and the escalation-audit procedure
moved to the `session-forensics` skill (data-location map, probe
notes). **Audit-trigger rule: when a command's behavior contradicts
documented sandbox rules (sudden success after failures), audit the
host-side chatSessions JSONL before theorizing** (§2). Evidence for
the retracted warm-up pattern: `docs/agent-terminal-rationale.md`.

## 8. Validation loop — moved

→ `pnpm-vite` skill §4: `vp install` after pulls, `vp check` +
`vp test`, `vite.config.ts`/`package.json` task discovery via
`vpr <script>`, `vp env doctor` for misbehavior.

## 9. Lint verification and autofix — moved

→ `pnpm-vite` skill §5: per-file checks via `vp lint <file>` (never
`vpr lint <file>`), the `--fix-suggestions` convergence loop, and the
`--fix` vs `--fix-suggestions` distinction.

## 10. Meta-rules — editing and propagating THIS file

This file is a distributed copy managed by `~/projects/sync-agent-rules.sh`
(itself Stow-installed from the wsl-ubuntu-config-private repo). The
workflows:

- **To edit the rules:** run
  `~/projects/sync-agent-rules.sh --begin <repo-path>` from the repo you
  want to edit in. It verifies no lock is held, that **the rules file
  itself** is uncommitted-clean, and that the repo copy matches central
  (footer-stripped) — refusing with backups on divergence. Other uncommitted
  work in the repo is allowed: only the rules file must be clean, since
  `--finish` touches only that file. Then run
  `~/projects/sync-agent-rules.sh --finish` to promote the edit to central,
  re-stamp, and propagate to all other repos. It prints (does not run) the
  commit command for the editing repo.
- **To promote edits made outside the workflow** (committed directly in a
  repo without `--begin`/`--finish`, or a repo that missed syncs): run
  `~/projects/sync-agent-rules.sh --promote <repo-path>`. It requires the
  rules file to be committed, backs up central before overwriting, and
  checks the copy's footer history for a sync from central's current
  content — warning and asking for confirmation when ancestry is uncertain
  (the copy may silently drop central-only changes). After promotion it
  syncs the new central out to all other repos.
- **To pull without editing:** run `~/projects/sync-agent-rules.sh` (plain
  sync) or `--check` for drift-only. `--adopt` offers to add the file to
  repos that have agent instructions but no copy yet (stamping a proper
  `synced=` footer, not cloning central's).
- **Use `--check` to determine current status before acting.** It reports
  drift only (no writes), listing repos whose copy differs from central
  with the rules file's git state — e.g.
  `DRIFT: coding-challenges-in-ts  main [modified-uncommitted]` means that
  repo's copy has un-promoted edits AND uncommitted changes (commit first;
  `--begin`/`--promote` refuse on uncommitted rules files). It also flags
  `LOCAL:` lines — up-to-date-but-uncommitted copies whose content matches
  central but carry uncommitted git state (invisible to drift detection;
  a plain sync would silently overwrite them). Drifted repos get an
  interactive viewer: pick a number (or `a` for all) to see the
  footer-stripped diff of that copy vs central, with meaningful
  `central`/`<repo>` headers. Run `--check` first to decide whether you
  need `--begin`/`--finish` (promoting an edit), `--promote` (committed
  divergent copy), or a plain sync (pulling central out).
- **Footers are script-managed.** Every copy ends in a footer BLOCK —
  trailing stamp lines, newest event first, capped at 5:
  `last-edit=<repo> at=<ts>` on central, `synced=<ts> src=<hash8>` on
  distributed copies, with previous stamps kept as history beneath. Never
  hand-edit it; drift comparison strips the whole block, so mixed/old
  single-line footers never cause false drift, and every write converts
  them to the block form. The `src=` hashes in the history are how
  `--promote` detects ancestry.
- **Locks:** a central directory lock (`~/projects/.agent-terminal-rules.lock`)
  prevents concurrent edits. A stale lock (>24h) can be stolen with
  `--force`. Never delete the lock manually while an edit session is live.
- **Sandbox note for editors:** the central file lives at `~/projects/`,
  outside the sandbox-visible filesystem — sync-script invocations and any
  direct central-file access need unsandboxed execution (request it
  explicitly with a reason). Editing the repo copy can be done with the
  VS Code edit tool (it sees the real filesystem).

## 11. File-tool writes — durability, Keep/Undo, and grants

> Verified 2026-10-27/28 on Copilot Chat 0.71.0 (evidence:
> ai-collaboration-guides `docs/plan/obsidian-agent-integration.md`
> E15/E16). The old "0-byte husk" history and mechanism (2026-10-17/19,
> not reproducible in current builds) live in
> `docs/agent-terminal-rationale.md`.

The file-tool layer (`create_file`, `replace_string_in_file`, …) is NOT
the sandboxed terminal layer: different permission gate, different
durability rules.

- **Writes land on disk immediately** at every tested tier
  (`~/agent-scratch/`, `$HOME` top, `/var/tmp`, workspace folders) and
  survive window reloads. "Pending edits" are a post-hoc REVIEW layer,
  not a durability gate. Keep = leave the change as-is (effectively a
  no-op). Undo = revert to the file's pre-pending state:
  - file-tool CREATE + Undo → file DELETED;
  - MODIFY + Undo → clean revert to prior content.
- **The pending queue holds one entry per file; modifies stack** on the
  file's entry. Undo data IS persisted (Windows-side
  `chatEditingSessions/<session-id>/` — `session-forensics` skill
  data-location 6), but the queue VIEW
  can drop entries silently on reload (observed: reload #1 preserved 7
  entries; reload #2 dropped 9 = silent auto-Keep, content intact).
  Review before reloading — a dropped entry is unreachable via the UI
  even though its content history remains on disk.
- **Husk history is in the rationale doc** (why layer):
  `docs/agent-terminal-rationale.md`.
- **Permission gates:** (1) settings grants —
  `chat.agent.sandbox.fileSystem.linux.allowWrite` +
  `userConfiguredPaths.readwritePaths` (Windows-side settings.json) —
  make writes silent in covered paths; (2) dialog grants elsewhere:
  "Allow in this session" and "Always Allow". Measured: "Always Allow"
  survived a window reload and covered far more than the dialog
  displayed (silent writes at `$HOME` top AND `/var/tmp`); "Allow in
  this session" did not survive a reload (for modifies). Dialog grants
  are recorded in NO settings file — they live in VS Code internal
  state. Full-restart persistence: unprobed.
- **The dialog does not state its scope** ("The model wants to edit
  files outside of your workspace (). …" with a mis-rendered
  `\home\jonathan` path). Measure scope behaviorally; never infer it
  from the dialog text, and never document a scope claim the probe did
  not measure.
- **Verify file-tool write success with an UNSANDBOXED `stat` in a
  later turn** — sandboxed stats at `$HOME` top are masked (§2), and a
  "successfully edited" tool result is not a durability claim
  (2026-10-27: `~/always-allow-scope-test-4.md` was believed "never
  materialized" for a week — it had existed all along).

<!-- agent-terminal-rules: synced=2026-11-02T18:14:14Z src=5b0c9bdc -->
<!-- agent-terminal-rules: synced=2026-11-02T18:09:09Z src=3e96e50a -->
<!-- agent-terminal-rules: synced=2026-11-02T15:04:48Z src=23f22102 -->
<!-- agent-terminal-rules: synced=2026-11-01T04:13:04Z src=ddc63ee0 -->
<!-- agent-terminal-rules: synced=2026-10-28T10:42:26Z src=74682c8c -->
