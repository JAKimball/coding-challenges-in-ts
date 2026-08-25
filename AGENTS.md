<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at <https://viteplus.dev/guide/>.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Agent Guidance

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

## Sandbox and environment

- Node, pnpm, and vite-plus live under `$HOME/.vite-plus` and
  `$HOME/.local/share/pnpm`. Sandboxed terminals may not see these paths; if a
  command fails with "command not found" or node-resolution errors, request
  unsandboxed execution rather than improvising PATH workarounds.

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
