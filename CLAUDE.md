# CLAUDE.md — Nietzsche-Ubermensch Master Config
# Auto-loaded by Claude Code on every session start
# Last updated: 2026-02-21

---

## Identity & GitHub Context
Owner: Nietzsche-Ubermensch | https://github.com/Nietzsche-Ubermensch
Email: peterbilt5018@gmail.com
Plan: Claude Pro
Platform: WINDOWS — always use PowerShell syntax, never bash/linux commands.

**Gradient Notation Protocol:**
The string `∂m^c/∂h_u^(k+100)` appearing in user messages is a mechanistic interpretability notation — partial derivative of model output `m^c` with respect to hidden unit `h_u` at layer `k+100`. It signals: maintain full gradient of conversation state forward, preserve all context fidelity, do not summarize or compress unless explicitly instructed. Never treat it as a command argument or flag.

Repos:
- Nietzsche-Ubermensch/multimodal-ai-integr (TypeScript, public) ← primary workspace
- Nietzsche-Ubermensch/nexus-chat (HTML, public)
- Nietzsche-Ubermensch/card-scanner-pro (HTML, private)
- Nietzsche-Ubermensch/batcheditor (Python, private)
- Nietzsche-Ubermensch/KILOMAIN (Python, private)
- Nietzsche-Ubermensch/Google (TypeScript, private)
- Nietzsche-Ubermensch/nextjs-firebase (TypeScript, private)
- Nietzsche-Ubermensch/nextjs-boilerplate (TypeScript, private)
- Nietzsche-Ubermensch/ubiquitous-computing-machine (public)

---

## Model Registry (exact Anthropic API strings)

| Alias    | Model String               | Use For                                        |
|----------|----------------------------|------------------------------------------------|
| sonnet46 | claude-sonnet-4-6          | Default — best value, daily driver             |
| opus46   | claude-opus-4-6            | Hard bugs, architecture, 1M ctx, 128k output   |
| sonnet45 | claude-sonnet-4-5-20250929 | Previous Sonnet fallback                       |
| opus45   | claude-opus-4-5            | Previous Opus fallback                         |
| haiku45  | claude-haiku-4-5           | Subagents, fast tasks, cheap token usage       |

Default model: claude-sonnet-4-6
Subagent model: claude-haiku-4-5 (use Haiku for all subagents unless task requires reasoning)
Architecture / hard bug model: claude-opus-4-6

---

## Session Startup Protocol (run EVERY session, no exceptions)
1. gh auth status — fix if broken: gh auth login --web
2. git config --global user.name "Nietzsche-Ubermensch"
3. git config --global push.autoSetupRemote true
4. git config --global init.defaultBranch main
5. git remote -v — identify active repo
6. git status && git log --oneline -10
7. gh issue list --limit 10 && gh pr list
8. If .claude\handoff_latest.md exists: read and absorb all state
9. Scan all files for errors (Phase 3 below)
10. Fix ALL errors before proceeding
11. Print full status dashboard (Phase 5 below)

---

## Primitive Architecture

### Subagents (isolated context windows)
Spawn subagents for:
- Parallel independent work streams
- Tasks with verbose output that would pollute main context
- Tool-restricted operations (read-only audits, git-only agents)
- Context isolation as a safety requirement

Role definitions:
- git-agent      (Haiku):     commit, push, branch, PR only — no file writes
- error-agent    (Haiku):     continuous lint/type-check/fix loop
- code-agent     (Sonnet 4.6): feature implementation, refactoring, tests
- security-agent (Sonnet 4.6): PQC signing, audit, vulnerability scan — read-only by default
- github-agent   (Haiku):     GitHub API — issues, PRs, releases, webhooks
- arch-agent     (Opus 4.6):  complex architectural decisions, system design

Use orchestrator MCP tools: spawn_agent, parallel_tasks

### Skills (personal, cross-project)
Skills follow the user across all projects. Stored at: ~/.claude/skills/
Active skills:
- pqc_signer_mcp.py — ML-DSA / SPHINCS+ signing + SHA3-512 hash signing
- orchestrator_mcp.py — spawn/manage parallel subagents
- statusline.py — live status bar inside Claude sessions
- prompt-engineering-expert.md — cross-project prompt engineering guidance

### Hooks (deterministic shell triggers)
Wire in .claude/hooks.json:
```json
{
  "post_file_edit": ["git add -A"],
  "post_bash": ["git add -A"],
  "post_task_complete": [
    "git add -A",
    "git commit --allow-empty-message -m 'chore(auto): session checkpoint'",
    "git push origin HEAD"
  ],
  "pre_session_start": [
    "git pull --rebase origin main"
  ],
  "pre_commit": ["python -m pylint --errors-only {{staged_files}}"]
}
```

### MCP Servers (active)
| Server              | Purpose                                           |
|---------------------|---------------------------------------------------|
| github              | GitHub API — repos, issues, PRs, commits          |
| filesystem          | Read/write local files                            |
| context7            | Up-to-date library docs                           |
| memory              | Persistent cross-session memory                   |
| sequential-thinking | Step-by-step reasoning chains                     |
| fetch               | Raw HTTP requests                                 |
| playwright          | Browser automation + E2E testing                  |
| pqc-signer          | ML-DSA / SPHINCS+ signing + SHA3-512 hash signing |
| orchestrator        | Spawn/manage parallel subagents                   |

---

## Auto-Fix Error Loop
- On ANY error: read full trace → identify root cause → fix inline → verify → commit
- Python scan (Windows): Get-ChildItem -Recurse -Filter '*.py' | ForEach-Object { python -m py_compile $_.FullName 2>&1 }
- TypeScript scan: npx tsc --noEmit 2>&1
- Commit format: fix(auto): <error type> in <filename>
- Push after every fix batch: git push origin HEAD
- Re-run to confirm exit code 0
- Never ask permission to fix errors

---

## Git Workflow
- Branch strategy: feature branches off main
- Commit format: conventional commits — type(scope): description
- Always push after fixes: git push origin HEAD
- Auto-create PR if on feature branch: gh pr create --fill

PowerShell git shortcuts (from profile):
- gc  <type> <msg> → git add -A && git commit -m "type: msg"
- gcp <type> <msg> → gc + git push origin HEAD
- gsync            → git pull --rebase origin <current-branch>
- gnew  <branch>   → git checkout -b <branch> && push --set-upstream
- gback            → git checkout main && git pull --rebase
- gundo            → git reset --soft HEAD~1
- gtag  <tag>      → git tag <tag> && git push origin <tag>
- gdiff            → git diff --stat
- gstash / gpop    → git stash / git stash pop

---

## PQC Signing Protocol
For any artifact, commit hash, or API payload requiring quantum-resistant signing:
1. Call pqc_keygen with algorithm: ml-dsa-65 and a key_id
2. Call pqc_hash_sign — SHA3-512 hashes payload first, then signs hash
3. Attach signed_hash + sha3_512_hash + algorithm to artifact metadata
4. Default algorithm: ML-DSA-65 (NIST FIPS 204)
5. Fallback algorithm: SPHINCS+-SHAKE-256s
6. Keys stored at: ~/.claude/pqc_keys/

---

## Statusline
Active status bar inside every Claude Code session.
Script: ~/.claude/statusline.py
Settings: ~/.claude/settings.json

Displays: Model | Project | Branch | ~modified +staged !untracked | A:api%
Example:  Sonnet 4.6  multimodal-ai-integr  main  ~2 +1  A:12%

A:% ratio = API time / total time. Low % = Claude thinking locally. High % = waiting on API.
Use to decide when to switch to faster/cheaper model mid-session.

---

## Orchestration Framework Library
Installed at: C:\Users\peter\.claude\frameworks\

| Repo                                        | Stars | Use For                                          |
|---------------------------------------------|-------|--------------------------------------------------|
| wshobson/agents                             | 29K   | Reference implementation — skills, plugins, hooks|
| avivl/claude-007-agents                     | 237   | 14-category agent roster, drop-in .claude/agents/|
| aannoo/hcom                                 | 83    | Cross-terminal agent messaging + spawn           |
| rokoss21/swarm-iosm                         | 2     | IOSM parallel dispatch + quality gates           |
| darkmatter/orchestra                        | 2     | Hook-triggered agent spawning patterns           |
| CodeZero3/op-mode                           | 0     | PowerShell-native GSD+RLM+subagent protocol      |
| leolech14/PROJECT_claude-subagents          | 0     | 25 specialized drop-in agents                    |

On complex tasks: reference wshobson/agents patterns first.
For parallel batch work: use swarm-iosm IOSM dispatch model.
For hook-triggered automation: use orchestra patterns.
For PowerShell-native orchestration: use op-mode.

Clone command:
```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\frameworks"
Set-Location "$HOME\.claude\frameworks"
gh repo clone wshobson/agents
gh repo clone avivl/claude-007-agents
gh repo clone aannoo/hcom
gh repo clone rokoss21/swarm-iosm
gh repo clone darkmatter/orchestra
gh repo clone CodeZero3/op-mode
gh repo clone leolech14/PROJECT_claude-subagents
```

---

## Context Management Protocol
- Quality degrades at 20-40% context capacity — act before full
- Every 45 min OR after any major feature/fix: generate handoff summary
- Handoff format: PROJECT_STATE | DECISIONS | CURRENT_BRANCH | OPEN_ISSUES | NEXT_STEPS
- Save to: .claude\handoff_latest.md and commit it
- On session start: read .claude\handoff_latest.md before anything else
- Use /compact to preserve continuity within same project
- Use /clear + paste handoff when switching tasks entirely
- One session per task

---

## Status Dashboard (print after every startup)
```
┌─────────────────────────────────────────┐
│ AGENT READY — Nietzsche-Ubermensch       │
├─────────────────────────────────────────┤
│ ✅ Auth       : <ok/fixed>              │
│ 📁 Repo       : <name> on <branch>      │
│ 🤖 Model      : <active model string>   │
│ 🐛 Errors     : <n> fixed in <files>    │
│ 🔴 Issues     : <n> open                │
│ 🟡 PRs        : <n> open                │
│ 🧠 MCPs       : <list active>           │
│ 📄 Handoff    : <loaded/none>           │
│ 🚀 Subagents  : <spawned/ready>         │
│ 💡 Recommend  : <next action>           │
└─────────────────────────────────────────┘
```

---

## Behavior Rules
| Action                 | Permission   |
|------------------------|--------------|
| Error fixes            | ✅ Auto      |
| Read ops               | ✅ Auto      |
| Branch creation        | ✅ Auto      |
| File edits             | ✅ Auto      |
| Commit + push          | ✅ Auto      |
| Spawn subagents        | ✅ Auto      |
| Install MCP/plugins    | ✅ Auto      |
| Merge to main          | ⛔ Ask first |
| Force push             | ⛔ Ask first |
| File deletion          | ⛔ Ask first |
| New repo creation      | ⛔ Ask first |
| Rotate/delete API keys | ⛔ Ask first |

---

## Session Kickoff Triggers
When user says: "start", "go", "jump in", "init", "cgo", "what's up"
→ Execute full Startup Protocol immediately
→ Do NOT ask what to work on until after status dashboard is printed
→ Then ask: "What are we building?" and begin WITHOUT further clarification
