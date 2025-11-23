# GitHub Workflows - Issues Found

## 🚨 Critical Issues

### 1. **Test Command Will Hang CI** (ALL WORKFLOWS)
**Files:** All 4 workflow files  
**Lines:** 
- `main-pr.yml`: 47, 50
- `main-push.yml`: 50, 53
- `develop-push.yml`: 46
- `release.yml`: 41

**Problem:**
```yaml
- name: Run tests
  run: npm test
```

Uses `npm test` which runs `vitest` in **watch mode** by default. This will:
- ✅ Hang forever waiting for user input
- ✅ Block all PRs
- ✅ **Prevent releases from completing** (most critical!)

**Fix:** Change to `npm test -- --run`

---

### 2. **Missing test:coverage Script**
**Files:** `main-pr.yml` (line 50), `main-push.yml` (line 53)

**Problem:**
```yaml
- name: Run tests with coverage
  run: npm run test:coverage
```

Script `test:coverage` doesn't exist in `package.json`.

**Fix:** Add script or remove step

---

### 3. **Release Workflow Dangerous**
**File:** `release.yml`

**Problems:**
- No safeguards against accidental publish
- No version validation (could publish same version twice)
- No dry-run verification
- Will hang on `npm test` (critical!)

**Risks:**
- Accidental publish to npm
- Overwrite existing version
- Publish broken code if tests hang

---

## ⚠️ Security Concerns

### 4. **Overly Permissive Permissions**
**File:** `release.yml` line 10

```yaml
permissions:
  contents: write
  id-token: write
```

**Issue:** `contents: write` allows modifying repository  
**Risk:** Could be exploited if workflow is compromised

**Recommendation:** Only use when creating release, not for entire job

---

### 5. **Missing Branch Protection**

**Problem:** No branch protection rules enforced in workflows

**Recommendations:**
- Require PR reviews before merge to main
- Require status checks to pass
- Prevent direct pushes to main
- Require signed commits

---

## 📋 Missing Features

### 6. **No Linter Checks**
None of the workflows run linting. Should add:
```yaml
- name: Lint
  run: npm run lint
```

### 7. **No Dependency Audit**
Security vulnerabilities not checked. Should add:
```yaml
- name: Audit dependencies
  run: npm audit --audit-level=moderate
```

### 8. **No Build Artifact Verification**
Release workflow doesn't verify dist/ contents before publishing.

### 9. **No Rollback Strategy**
If publish succeeds but tests fail, no way to unpublish.

---

## 🔧 Recommended Fixes

### Priority 1 (CRITICAL - Breaks CI/CD)
1. Fix `npm test` → `npm test -- --run` in ALL workflows
2. Add `test:coverage` script OR remove those steps
3. Add safeguards to release workflow

### Priority 2 (Security)
4. Restrict release workflow permissions
5. Add npm audit checks
6. Add version validation to release

### Priority 3 (Quality)
7. Add linter checks
8. Add build artifact verification
9. Add PR template with checklist
10. Setup branch protection rules

---

## Safe Workflow Pattern

```yaml
# Example safe workflow
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.x
          cache: npm
      
      - name: Install
        run: npm ci
      
      - name: Audit
        run: npm audit --audit-level=moderate
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npm run typecheck
      
      - name: Test
        run: npm test -- --run  # ← Fixed!
      
      - name: Build
        run: npm run build
      
      - name: Verify
        run: npm pack --dry-run
```


