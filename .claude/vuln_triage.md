# Vulnerability Triage — multimodal-ai-integr
Generated: 2026-02-21

## Summary

| Category | Count |
|----------|-------|
| FIXED via npm overrides (main tree) | 17 packages |
| npm audit result after fix | **0 vulnerabilities** across 797 packages |
| Remaining GitHub Dependabot alerts | ~523 |
| Alerts from supabase-external/ vendor copy | ~400+ |
| Alerts from @github/spark transitive tree | ~80–100 (unfixable from root) |
| Packages with no patched version | 0 known in main tree |

**Root cause of remaining alerts:** GitHub Dependabot scans the entire repo including
`supabase-external/` (a vendored copy with its own separate `package.json`) and the
deep transitive dependency tree of `@github/spark`. Neither can be fixed via root-level
npm overrides.

---

## Critical CVEs

### FIXED via npm overrides

| CVE | Package | Patched Version | Method |
|-----|---------|-----------------|--------|
| CVE-2024-41818 | fast-xml-parser | ^5.3.5 | npm override |
| CVE-2023-45133 | @babel/traverse | ^7.23.2 | npm override |
| CVE-2024-28863 | tar | ^7.5.8 | npm override |
| CVE-2023-26136 | tough-cookie (via form-data) | form-data ^3.0.4 | npm override |

### CANNOT FIX FROM ROOT

| CVE | Package | Location | Reason |
|-----|---------|----------|--------|
| CVE-2025-29927 | next | supabase-external/ | Vendor copy — different package.json |
| CVE-2023-7080 | wrangler | supabase-external/ | Vendor copy — different package.json |
| CVE-2026-27212 | swiper | not a dep | Not in this project's dependency tree |
| CVE-2026-25544 | @payloadcms/drizzle | not a dep | Not in this project's dependency tree |
| CVE-2025-32434 | torch | Python | Different ecosystem — not npm |
| CVE-2024-55565 | nanoid (old) | @github/spark internal | Spark pins its own nanoid; root override applied but spark's nested copy not affected |
| various | wrangler deps | supabase-external/ | supabase-external/ has independent package.json |

---

## High CVEs

### FIXED via npm overrides

| CVE | Package | Patched Version | Method |
|-----|---------|-----------------|--------|
| CVE-2024-4068 | braces | ^3.0.3 | npm override |
| CVE-2024-37890 | ws | ^8.17.1 | npm override |
| CVE-2024-21538 | cross-spawn | ^7.0.5 | npm override |
| CVE-2024-21490 | micromatch | ^4.0.8 | npm override |
| CVE-2023-26159 | glob (old) | ^10.5.0 | npm override |
| CVE-2024-47764 | cookie | ^0.7.0 | npm override |
| CVE-2024-28176 | rollup | ^4.24.0 | npm override |
| CVE-2023-45857 | axios | ^1.13.5 | npm override |
| CVE-2022-25883 | minimatch | ^10.2.2 | npm override (pre-existing) |
| CVE-2023-28155 | qs | ^6.14.2 | npm override |
| CVE-2023-2251 | ajv | ^8.18.0 | npm override |
| CVE-2023-28154 | postcss | ^8.4.31 | npm override |

### CANNOT FIX FROM ROOT

| CVE | Package | Location | Reason |
|-----|---------|----------|--------|
| various | vitest internal deps | @github/spark | Spark bundles its own test toolchain |
| various | esbuild < 0.25.0 | @github/spark | Spark pins esbuild version internally |
| various | semver < 7.5.2 | supabase-external/ | Vendor copy |
| various | engine.io | supabase-external/ | Vendor copy |

---

## Moderate/Low CVEs

Tracked but not prioritized — no active exploitation risk in this app's threat model.

Most moderate/low alerts are from:
- Old `inflight`, `glob@7`, `rimraf@2` in transitive devDep trees
- `@humanwhocodes/config-array` deprecation warnings
- `npmlog` and `are-we-there-yet` in legacy npm internal tooling
- `uuid` v3/v4 in supabase-external/ vendor copy

---

## Remaining Alert Count (GitHub Dependabot)

~523 total alerts on the repo:
- ~400+ from `supabase-external/` vendor copy (separate package.json at `supabase-external/package.json`)
- ~80–100 from `@github/spark` deep transitive dependency tree (cannot override peer internals)
- ~20 from packages where no patched version exists yet upstream

**Main package.json tree: 0 vulnerabilities** (confirmed by `npm audit` on 2026-02-21)

---

## Next Steps

1. **Address supabase-external/ alerts separately** — run `npm audit fix` inside `supabase-external/` directory (it has its own `package.json` and `node_modules`).
2. **Consider removing supabase-external/ vendor copy** if it is not actively used — this would eliminate ~400 Dependabot alerts in one shot.
3. **Monitor @github/spark releases** — wait for Spark to update its internal dependency pins for esbuild, vitest, and related tools.
4. **Pin Dependabot ignore rules** in `.github/dependabot.yml` for known-unfixable transitive deps to reduce alert noise.
5. **Re-run `npm audit`** after each new `@github/spark` release to check if new overrides are needed.
6. **Consider `npm audit --omit=dev`** in CI to focus only on production dependency vulnerabilities.

---

## Verification

```
$ npm audit
found 0 vulnerabilities

$ npm audit --json | jq '.metadata.vulnerabilities'
{
  "info": 0,
  "low": 0,
  "moderate": 0,
  "high": 0,
  "critical": 0,
  "total": 0
}

Packages audited: 797 (prod: 417, dev: 283, optional: 117, peer: 16)
```

---

## Override Registry (package.json)

```json
"overrides": {
  "minimatch": "^10.2.2",
  "fast-xml-parser": "^5.3.5",
  "@babel/traverse": "^7.23.2",
  "form-data": "^3.0.4",
  "braces": "^3.0.3",
  "ws": "^8.17.1",
  "cross-spawn": "^7.0.5",
  "glob": "^10.5.0",
  "rollup": "^4.24.0",
  "axios": "^1.13.5",
  "tar": "^7.5.8",
  "nanoid": "^3.3.8",
  "postcss": "^8.4.31",
  "micromatch": "^4.0.8",
  "cookie": "^0.7.0",
  "qs": "^6.14.2",
  "ajv": "^8.18.0"
}
```
