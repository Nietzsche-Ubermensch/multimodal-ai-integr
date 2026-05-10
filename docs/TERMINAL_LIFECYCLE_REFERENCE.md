# Terminal Lifecycle Reference — DeepSeek TUI v0.8.6

> **Authoritative contributor reference.** This document defines terminal mode ownership, lifecycle ordering contracts, and invariants that every contributor and reviewer **must** understand before touching terminal-adjacent code.

---

## Table of Contents

1. [Ownership Map](#1-ownership-map)
2. [Layer-by-Layer Module Reference](#2-layer-by-layer-module-reference)
   - [1. User Interface Layer (terminal lifecycle owner)](#layer-1-user-interface-layer--terminal-lifecycle-owner)
   - [2. Core Engine Layer (terminal-neutral)](#layer-2-core-engine-layer--terminal-neutral-by-contract)
   - [3. Tool & Extension Layer (terminal-agnostic)](#layer-3-tool--extension-layer--strictly-terminal-agnostic)
   - [4. Runtime API & Task Management (headless-first)](#layer-4-runtime-api--task-management--headless-first-participants)
   - [5. LLM & Diagnostics Integration (terminal-oblivious)](#layer-5-llm--diagnostics-integration--terminal-oblivious-ui-consumed)
3. [Cross-Cutting Invariants](#3-cross-cutting-invariants)
4. [Common Newcomer Mistakes](#4-common-newcomer-mistakes)
5. [PR Review Checklist](#5-pr-review-checklist)

---

## 1. Ownership Map

Terminal lifecycle ownership is **non-negotiable and singular** in v0.8.6:

| Role | Module(s) |
|---|---|
| **Primary owner** (terminal lifecycle) | `crates/tui` — entry/runtime path |
| Entry routing | `crates/tui/src/main.rs` |
| App loop | `crates/tui/src/tui/app.rs`, `crates/tui/src/tui/ui.rs` |
| UI helpers | `crates/tui/src/tui/approval.rs`, `streaming.rs`, `clipboard.rs` |
| **Secondary participants** (terminal-neutral — must not toggle terminal state) | `core/engine*`, `runtime_api.rs`, `task_manager.rs`, `tools/*`, `lsp/*`, `hooks.rs`, `mcp.rs` |

### Split-Crate Caution

> ⚠️ **Critical.** Even though `crates/core`, `crates/tui-core`, and `crates/app-server` exist in the workspace, the v0.8.6 runtime source of truth remains **`crates/tui`**. Teardown sequencing and panic/signal restoration responsibility lives there — not in split crates. Do **not** assume ownership has migrated until an explicit ADR/PR documents the transfer.

---

## 2. Layer-by-Layer Module Reference

---

### Layer 1: User Interface Layer — Terminal Lifecycle Owner

---

#### `crates/tui/src/main.rs`

**Owns:** Process entry, mode selection (interactive TUI vs. one-shot vs. serve/config flows), and the decision of whether terminal state mutation is required.

##### MUST

- Provide a **single, explicit branch** that enters terminal UI mode — no implicit or scattered terminal initialization.
- Enforce the following **initialization ordering contract**:
  1. Install panic/error restoration guard
  2. Enable raw mode
  3. Enter alternate screen
  4. Initialize ratatui backend/frame loop
- Enforce the following **exit ordering contract** (reverse-safe):
  1. Leave alternate screen
  2. Disable raw mode
  3. Restore cursor/terminal state
  4. Flush final diagnostics/log line
- Ensure that non-TUI commands (`serve`, one-shot, background automation) **never** run alt-screen or raw-mode setup.

##### MUST NOT

- **Must not** move terminal mode toggles into `core/` or shared crates during incremental splitting unless runtime ownership is explicitly migrated with a documented ADR.
- **Must not** permit multiple code paths that each attempt independent terminal initialization.

---

#### `crates/tui/src/tui/app.rs`

**Owns:** Top-level TUI application state, message/event handling contract, and lifecycle coupling between the UI state machine and the terminal render loop.

##### MUST

- Implement app-level shutdown paths that **always bubble to terminal teardown** — this includes error exits, interrupts, and approval cancellation paths.
- Define clear "UI loop end" signal semantics so `main.rs` can unconditionally restore terminal state.

##### MUST NOT

- **Must not** perform direct raw-mode or alternate-screen toggling inside deep state handlers unless the toggle is explicitly encapsulated, scoped, and proven reversible.
- **Must not** assume terminal state can be safely re-entered after a partial shutdown.

---

#### `crates/tui/src/tui/ui.rs`

**Owns:** Render/event loop behavior (ratatui-facing mechanics), streaming output rendering, and interaction-state transitions.

##### MUST

- Cooperate with signal/interrupt flow and exit cleanly on interrupt.
- Ensure no panic path bypasses upstream terminal restore.
- When using terminal-size polling or redraw throttling, **must not block shutdown restoration**.

##### MUST NOT

- **Must not** perform global mode transitions — these belong exclusively to the bootstrap/teardown owner (`main.rs`), not per-component draw code.

> **Contributor warning:** Rendering code often appears "close to terminal internals." This proximity is misleading. Draw functions are consumers of terminal state, not owners of it.

---

#### `crates/tui/src/tui/approval.rs`, `streaming.rs`, `clipboard.rs`

**Owns:** Specialized UI interactions only.

##### MUST

- Operate as **terminal-mode agnostic consumers** — no assumptions about or manipulation of raw/alt mode.
- Propagate errors as recoverable UI events where possible.
- Route fatal errors through the centralized teardown path.

##### MUST NOT

- **Must not** directly install competing panic hooks.
- **Must not** perform raw-mode or alternate-screen transitions independently.

---

#### `crates/tui/src/ui.rs` (legacy/simple UI utilities)

**Owns:** Legacy/simple non-primary UI paths.

##### MUST

- Follow the **no-duplicate-terminal-init rule** — identical contract to all other UI layer modules.
- If still callable, remain compatible with the centralized teardown owner.

##### MUST NOT

- **Must not** introduce terminal mode toggles even though the module name ("ui") may suggest otherwise.

> ⚠️ **Newcomer trap.** New contributors frequently add terminal toggles here because the module name implies UI ownership. Unless this module is explicitly designated as an entry path, it has no terminal lifecycle authority.

---

### Layer 2: Core Engine Layer — Terminal-Neutral by Contract

---

#### `crates/tui/src/core/engine.rs`, `core/engine/turn_loop.rs`, `core/engine/capacity_flow.rs`

**Owns:** Agent loop, turn orchestration, tool execution flow, and interventions.

##### MUST

- Implement **pure runtime behavior independent of terminal mode**.
- Emit events/messages consumable equally by TUI and runtime API contexts.
- Handle interrupts and cancellations without assuming TTY capabilities.
- Expose clean cancellation semantics that the UI loop can map to graceful teardown.

##### MUST NOT

- **Must not** reference, check, or mutate terminal mode (raw/alt screen/cursor state).
- **Must not** format output assuming a raw-mode TTY.

---

#### `crates/tui/src/core/events.rs`, `session.rs`, `turn.rs`, `ops.rs`

**Owns:** Event/state transport and operation semantics.

##### MUST

- Maintain durable state that survives UI restarts.
- Keep all stdout/stderr output free of raw-mode assumptions.

##### MUST NOT

- **Must not** embed terminal control sequences or mode-dependent formatting.

---

### Layer 3: Tool & Extension Layer — Strictly Terminal-Agnostic

---

#### `crates/tui/src/tools/*` (`shell`, `file`, `todo`, `tasks`, `github`, `automation`, `plan`, `subagent`, `rlm`)

**Owns:** Tool execution semantics and result metadata.

##### MUST

- Operate **identically** in TUI and runtime API (`deepseek serve --http`) contexts.
- Route any interactive need through the model/user approval abstraction — not through direct terminal reads.

##### MUST NOT

- **Must not** perform any terminal mode manipulation.

---

#### `crates/tui/src/hooks.rs` and workspace `crates/hooks`

**Owns:** Pre/post tool lifecycle hook dispatch.

##### MUST

- Emit hook output via structured events/log channels to avoid corrupting TUI screen state.
- Propagate hook failures such that they do not bypass the UI teardown path.

##### MUST NOT

- **Must not** write directly to stdout/stderr in ways that corrupt TUI render output.

> **Split-boundary caution:** Even if hook implementation lives in the `crates/hooks` split crate, runtime orchestration and final teardown remain governed by `crates/tui` at v0.8.6.

---

#### `crates/tui/src/mcp.rs` and workspace `crates/mcp`

**Owns:** MCP client/server tool integration.

##### MUST

- Keep external tool communication fully independent of terminal state.
- Propagate transport failures as engine/tool errors.

##### MUST NOT

- **Must not** trigger terminal exits on transport failure — errors surface through the engine error path, not terminal teardown.

---

#### `crates/tui/src/skills.rs`

**Owns:** Skill/plugin loading.

##### MUST

- Route all user-facing interaction through the UI/event system.

##### MUST NOT

- **Must not** mutate terminal modes directly during skill execution.

---

### Layer 4: Runtime API & Task Management — Headless-First Participants

---

#### `crates/tui/src/runtime_api.rs`

**Owns:** HTTP/SSE runtime API (`deepseek serve --http`), thread endpoints, and turn endpoints.

##### MUST

- Be **fully operable without a TTY** — this is the primary design constraint.
- Coordinate shutdown handlers with process lifecycle.

##### MUST NOT

- **Must not** initialize alternate screen or raw mode under any code path.
- **Must not** depend on TUI teardown machinery for its own shutdown.

> ⚠️ **Newcomer trap.** Because `runtime_api.rs` lives inside `crates/tui`, newcomers assume it can reuse TUI bootstrap. It **cannot**. Its physical location is an artifact of the current monorepo layout, not a statement of lifecycle coupling.

---

#### `crates/tui/src/task_manager.rs`, `crates/tui/src/runtime_threads.rs`

**Owns:** Durable task/thread/timeline persistence and worker execution.

##### MUST

- Terminate safely regardless of whether the TUI is active.
- Complete persistence/checkpoint operations on shutdown without coupling to terminal restoration success.

##### MUST NOT

- **Must not** take any terminal ownership — not even transiently.

---

### Layer 5: LLM & Diagnostics Integration — Terminal-Oblivious, UI-Consumed

---

#### `crates/tui/src/llm_client.rs`, `client.rs`, `models.rs`

**Owns:** API transport, streaming parse, and request/response models.

##### MUST

- Emit **generic streaming events** — UI rendering logic decides presentation and formatting.

##### MUST NOT

- **Must not** emit terminal control codes or make raw-mode assumptions in streamed output.

---

#### `crates/tui/src/lsp/` and `core/engine/lsp_hooks.rs`

**Owns:** Post-edit diagnostics collection/injection pipeline.

##### MUST

- Respect the following ownership split:
  - **LSP manager** — collects diagnostics
  - **Engine** — schedules diagnostic flush
  - **TUI** — renders diagnostics

##### MUST NOT

- **Must not** perform raw/alt mode transitions in any of these three layers.
- **Must not** collapse the three-layer split by having collection logic format for terminal or having TUI logic drive collection scheduling.

---

## 3. Cross-Cutting Invariants

These invariants apply across all modules. Any PR that violates one requires explicit justification and team sign-off.

| # | Invariant | Description |
|---|---|---|
| 1 | **Single terminal lifecycle owner** | One bootstrap/teardown authority in the TUI entry path. No exceptions. |
| 2 | **Idempotent restore** | The restore routine must be safe to call on normal exit, error exit, panic path, and signal path. Calling it multiple times must not corrupt state. |
| 3 | **Panic hook chaining** | The custom panic hook must restore terminal state, then delegate/log without swallowing diagnostics. |
| 4 | **Signal handling** | Interrupt and terminate signals trigger app shutdown intent, then centralized teardown — not direct terminal restoration from signal handler context. |
| 5 | **Headless isolation** | `runtime_api` and task workers never require terminal mode changes. Verified by integration tests against `deepseek serve --http`. |
| 6 | **No nested raw-mode ownership** | Submodules and components never "temporarily" re-own raw mode unless the scope is fully bounded and formally reviewed. |
| 7 | **Split-crate caution** | During refactor, do not assume `crates/core` or `crates/tui-core` owns process lifecycle until an explicit migration ADR/PR lands and is merged. |

---

## 4. Common Newcomer Mistakes

| Mistake | Where it typically appears | Why it's wrong |
|---|---|---|
| Adding `enable_raw_mode()` / `enter_alternate_screen()` calls in draw/component code | `tui/ui.rs`, per-widget files | Terminal mode is owned by `main.rs` bootstrap. Component code is a consumer, not an owner. |
| Assuming `runtime_api.rs` can share TUI bootstrap because it's in `crates/tui` | `runtime_api.rs` | Physical co-location ≠ lifecycle coupling. Runtime API is headless-first by design. |
| Adding terminal mode toggles to `crates/tui/src/ui.rs` (the legacy utilities file) | `ui.rs` | The module name suggests UI authority; it has none beyond legacy utilities. Only designated entry paths own terminal state. |
| Moving terminal setup into `crates/core` or `crates/tui-core` during a "cleanup" refactor | Any split-crate migration | Ownership has not been migrated unless an ADR explicitly says so. Moving code without migrating ownership silently breaks teardown sequencing. |
| Writing hook output directly to `stdout`/`stderr` instead of the event/log channel | `hooks.rs`, `crates/hooks` | Direct writes corrupt TUI screen state. All hook output must route through structured channels. |
| Installing a second panic hook in a submodule (e.g., an approval or streaming helper) | `approval.rs`, `streaming.rs` | Competing panic hooks suppress terminal restoration. Only one hook, owned by `main.rs` bootstrap, is permitted. |
| Embedding terminal control sequences in LLM streaming output formatters | `llm_client.rs`, streaming helpers | Streaming events must be generic. The TUI layer decides how to render — not the transport layer. |

---

## 5. PR Review Checklist

Use this checklist for every PR that touches `crates/tui`, `crates/hooks`, `crates/mcp`, or any code path that could affect terminal state.

### Terminal Lifecycle Ownership

- [ ] No new `enable_raw_mode()` / `disable_raw_mode()` / `enter_alternate_screen()` / `leave_alternate_screen()` calls outside `crates/tui/src/main.rs` bootstrap/teardown path (or a clearly documented, scoped exception).
- [ ] Any new TUI entry point follows the initialization ordering contract: panic guard → raw mode → alt screen → ratatui backend.
- [ ] Any new TUI exit path follows the exit ordering contract (reverse): leave alt screen → disable raw mode → restore cursor → flush diagnostics.
- [ ] Non-TUI commands (serve, one-shot, headless) do not invoke any terminal setup code path.

### Panic & Signal Handling

- [ ] No competing/overwriting panic hooks introduced by new code. Only `main.rs` installs the terminal-restoring panic hook.
- [ ] The existing panic hook calls terminal restore before delegating to the default handler.
- [ ] Signal handler (SIGINT/SIGTERM) routes to app shutdown intent — not directly to raw `disable_raw_mode()`.

### Idempotent Restore

- [ ] Terminal restore routine is safe to call multiple times (normal exit, error exit, panic, signal).
- [ ] No restore path that can fail silently and leave terminal in raw mode on process exit.

### Headless / Terminal-Neutral Modules

- [ ] `runtime_api.rs` changes do not introduce TTY checks, raw mode, or alt screen setup.
- [ ] `task_manager.rs` / `runtime_threads.rs` changes have no terminal dependency.
- [ ] All `tools/*` modules continue to operate identically in TUI and `deepseek serve --http` contexts.
- [ ] Hook output (`hooks.rs`, `crates/hooks`) routes through structured events/log channels — no direct `print!` / `eprintln!` that could corrupt TUI state.

### LLM & Diagnostics

- [ ] Streaming events emitted by `llm_client.rs` / `client.rs` are terminal-agnostic (no control sequences embedded in event payloads).
- [ ] LSP diagnostic collection (`lsp/`, `core/engine/lsp_hooks.rs`) remains separated from diagnostic rendering — collect / schedule / render split is preserved.

### Split-Crate Safety

- [ ] If code was moved to or from `crates/core`, `crates/tui-core`, or `crates/app-server`: ownership of teardown sequencing and panic restoration is explicitly accounted for in the PR description.
- [ ] No assumption that a split crate owns process lifecycle without a merged ADR.

### General

- [ ] PR description explicitly identifies any terminal-adjacent changes and justifies them.
- [ ] If a MUST NOT rule is intentionally violated, a code comment and PR note document the reason and the bounded scope.
- [ ] Reviewer has run the project in both interactive TUI mode and `--http` headless mode and confirmed terminal state is clean on exit in both paths.

---

*Document scope: DeepSeek TUI v0.8.6. Revisit ownership assignments before merging any PR that performs a crate split migration.*
