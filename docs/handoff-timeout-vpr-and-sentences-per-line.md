# Handoff: `timeout`/`vpr` Interaction & `sentences-per-line` Plugin

> **Revision:** 2026-08-31 — initial findings from the 2026-08-31 session.
> Status: **open investigation** — resume from § Next Steps.

Two related-but-separate issues discovered while validating
`vpr lint:md` (markdownlint-cli2) in this repo. Neither blocks normal use;
both matter for scripted/CI usage and for restoring the custom rule.

---

## Issue 1: `timeout` + `vpr` — timeout always waits its full duration

### Symptom

`timeout <N> vpr <script>` **always takes exactly N seconds**, even when the
underlying script finishes (or would finish) well before N:

```text
vpr lint:md alone:                 ~2.9s  (exit 1, 76 output lines)
timeout 3  vpr lint:md:            3.0s   (exit 124, output truncated)
timeout 5  vpr lint:md:            5.0s   (exit 124, output complete)
timeout 10 vpr lint:md:            10.0s  (exit 124, output complete)
timeout 10 vpr --version:          10.0s  (exit 124; alone it fails in ~1s)
```

The same is true for `time (timeout 10 sh -c '... vpr ...')` — the subshell
form the issue was first noticed in. The subshell is **not** the trigger; any
`timeout` + `vpr` combination exhibits it.

Controls that do NOT hang:

- `timeout 10 vp --version` → 0.2s (vp binary directly, no script)
- `timeout 5 node --version` → instant
- `timeout 15 node markdownlint-cli2-bin.mjs ...` → 2.5s (direct node, no vp)
- `timeout 10 sh -c '... pnpm lint:md ...'` → ~3s (pnpm, not vpr)

So the interaction is specifically **`timeout` + `vpr` (vp running a
package.json script)**.

### Evidence collected

Process tree mid-run (`timeout 8 vpr lint:md`, sampled at ~2.5s):

```text
<timeout-pid>  <bash>     S    timeout        ← timeout(1)
<vp-pid>       <timeout>  Sl   vpr            ← vp binary (symlink to vp)
<node-pid>     <vp-pid>   Rl   MainThread     ← node running markdownlint-cli2
```

- All three share the **same PGID** (the timeout process's), so this is not a
  process-group split.
- `kill -TERM <vpr-pid>` directly at 1s: vpr dies instantly (exit 143) —
  **vp does not trap SIGTERM**.
- But under `timeout`, the lint **keeps running to completion** (76 output
  lines present even when exit is 124) while `timeout` still waits the full
  duration and reports 124.
- At t=5s of a `timeout 10` run: `timeout` and `vpr` both still alive, output
  already complete (4 lines at that sample, 76 by the end).
- `timeout --foreground 10 vpr lint:md` → 3.1s, exit 1 (works correctly!).

### Current hypothesis (unverified)

`vp` (the Rust binary) appears to **swallow or defer SIGTERM while a task is
running** — but only in its script-running path (`vpr`/`vp run`), not for
built-in commands like `vp --version`. Possible mechanisms:

1. vp installs a SIGTERM handler during task execution that finishes the
   current task before exiting (graceful-shutdown design). `timeout` sends
   SIGTERM at expiry; vp acknowledges but keeps working; timeout's
   `wait()` therefore doesn't return until vp finally exits — which, for a
   2.9s job under `timeout 10`, is… still 10s. This part doesn't fully
   cohere: if vp exits at 2.9s, timeout should return then.
2. vp's process management (it uses `pidfd_spawn`/`posix_spawn` per its
   symbol table) may keep a pipe or waitpid handle open that `timeout`'s
   parent (or `time`) blocks on. The `time ( ... )` subshell form showed
   `user 0m0.003s` with full-duration waits — consistent with a *parent*
   blocked in a wait syscall rather than CPU work.
3. `timeout --foreground` working correctly suggests the default
   (process-group) signal path is what interacts badly with vp's own
   process-group/session handling.

### Next steps (resume here)

1. `strace -f -e trace=signal,wait4,waitid timeout 5 vpr --version` — see who
   sends/receives SIGTERM and what timeout waits on. (Needs unsandboxed
   execution; strace may need installing.)
2. Compare with `strace` on `timeout 5 node markdownlint-cli2-bin.mjs ...`
   (known-good) to spot the divergence.
3. Check vp release notes / source for signal handling in the task runner
   (`vp run` path). The binary is at `~/.vite-plus/current/bin/vp`.
4. Test `timeout --preserve-status 5 vpr lint:md` and
   `timeout -s KILL 5 vpr lint:md` (SIGKILL can't be trapped — if KILL makes
   it exit at 5s, that confirms signal swallowing).
5. If confirmed as vp behavior, consider: file an issue upstream
   (vite-plus), or avoid `timeout` around `vpr` in scripts (use
   `timeout --foreground`, or wrap the *inner* command instead).

### Practical workarounds (verified)

- `timeout --foreground <N> vpr <script>` — behaves correctly.
- Put the timeout *inside*: `vpr` is only a script runner; wrapping the
  underlying tool directly (e.g. `node markdownlint-cli2-bin.mjs`) with
  `timeout` works fine.
- Don't use bare `timeout` + `vpr` in CI/scripts expecting early exit.

---

## Issue 2: `sentences-per-line` plugin broken at 0.5.3

### Symptom (issue 2)

`vpr lint:md` fails immediately with:

```text
Error: Property 'names' of custom rule at index 0 is incorrect: 'undefined'.
```

### Cause

`package.json` had `"sentences-per-line": "^0.2.2"`. A `pnpm up --latest`
bumped it to **0.5.3**, which is a **breaking rename stub**: the package's
default export is now literally

```js
export default () => {
    throw new Error("The Markdownlint sentences-per-line plugin is now in the dedicated markdownlint-sentences-per-line package.");
};
```

markdownlint-cli2 loads it as a custom rule (`.markdownlint-cli2.jsonc` →
`"customRules": ["sentences-per-line"]`), the stub has no `names` property,
and markdownlint throws.

Note the pnpm warning during upgrade:

> "sentences-per-line@>=0.2.2 <0.3.0-0" was updated to 0.5.3, not 0.2.2 …
> To use 0.2.2, add an override to pnpm-workspace.yaml

The `^0.2.2` range in package.json was apparently rewritten to `^0.5.3` by
the `--latest` upgrade.

### Fix options (pick one)

1. **Migrate to the renamed package** (preferred long-term):
   `pnpm remove sentences-per-line && pnpm add -D markdownlint-sentences-per-line`,
   then update `customRules` in `.markdownlint-cli2.jsonc` to the new
   package name. Verify the new package's export shape matches what
   markdownlint expects (`names` array etc.).
2. **Pin the old version**: add to `pnpm-workspace.yaml`:
   ```yaml
   overrides:
     "sentences-per-line@>=0.2.2 <0.3.0-0": "0.2.2"
   ```
   and revert the package.json range to `^0.2.2`.

### Current state

- `package.json` currently has `"sentences-per-line": "^0.5.3"` (broken).
- `.markdownlint-cli2.jsonc` still references it in `customRules`.
- With the custom rule removed, `vpr lint:md` runs in ~3s and reports
  70 pre-existing issues in 7 files (MD060 table style in ad-hoc docs,
  MD040 code language, MD034 bare URL, MD037 emphasis spacing) — these are
  the *newly visible* findings now that the rule errors out; they were
  previously masked by the crash (or the run never reached reporting).
- The 100%-CPU hung processes seen on 2026-08-31 (two
  `markdownlint-cli2-bin.mjs` at ~99% for 12+ min) occurred with the
  **0.2.2** plugin under the sandboxed terminal; root cause not confirmed
  (possibly sandbox-related, possibly the same plugin). They were killed
  manually. Subsequent runs complete in ~3s, so treat as transient but
  watch for recurrence.

### Next steps for issue 2 (resume here)

1. Choose fix option 1 or 2 above; verify `vpr lint:md` exits 0 (or with
   ordinary findings, not the `names` error).
2. Re-baseline the 70 findings: fix or explicitly ignore (per-folder
   `.markdownlint-cli2.jsonc` overrides) — several are in
   `src/aoc/ad-hoc/` docs that may warrant an ignore entry.
3. Re-enable `sentences-per-line` enforcement and confirm it still catches
   violations (test with a deliberately bad line).

---

## Related context

- `docs/agent-terminal-rules.md` § 9 documents the related `vp lint` vs
  `vpr lint` per-file verification pitfall (different issue).
- The sandboxed terminal has a history of node-resolution flakiness
  (`node: not found` exit 127) — see `docs/agent-terminal-rules.md` § 1.
  The hung-process incident may be related but is unconfirmed.
