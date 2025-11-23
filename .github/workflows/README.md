# GitHub Actions Workflows

Complete CI/CD pipeline for Payload Patrol.

## Workflows

### 1. PR CI (`main-pr.yml`)

**Triggers:** Pull requests to `main` branch

**Features:**
- ✅ Tests on 3 Node versions (18.x, 20.x, 22.x)
- ✅ Dependency audit
- ✅ Type checking
- ✅ Test execution (161 tests)
- ✅ Coverage reporting
- ✅ Build verification
- ✅ Codecov integration

**Runs:** On every PR to main  
**Matrix:** 3 Node versions  
**Duration:** ~2-3 minutes  

---

### 2. Main CI (`main-push.yml`)

**Triggers:** Direct pushes to `main` branch

**Features:**
- ✅ Full validation suite
- ✅ Dependency audit
- ✅ Type checking
- ✅ Test execution
- ✅ Coverage reporting
- ✅ Build verification

**Runs:** On every push to main  
**Node Version:** 22.x  
**Duration:** ~1-2 minutes  

---

### 3. Develop CI (`develop-push.yml`)

**Triggers:** Pushes/PRs to `develop` branch

**Features:**
- ✅ Multi-version testing (18.x, 20.x, 22.x)
- ✅ Dependency audit
- ✅ Type checking
- ✅ Test execution
- ✅ Build verification

**Runs:** On every push/PR to develop  
**Matrix:** 3 Node versions  
**Duration:** ~2-3 minutes  

---

### 4. Release & Publish (`release.yml`)

**Triggers:** Tags matching `v*.*.*` (e.g., `v1.2.3`)

**Two-Stage Process:**

#### Stage 1: Validate
- ✅ Tag format validation
- ✅ Version match check (tag vs package.json)
- ✅ Duplicate version prevention
- ✅ Dependency audit
- ✅ Type checking
- ✅ Test execution (all 161 tests)
- ✅ Build verification
- ✅ Package contents validation

#### Stage 2: Publish (only if validate passes)
- ✅ Build final package
- ✅ Publish to npm with provenance
- ✅ Create GitHub release with notes

**Safety Features:**
- ✅ Prevents accidental publish
- ✅ Prevents duplicate versions
- ✅ Requires all tests to pass
- ✅ Minimal permissions (principle of least privilege)
- ✅ Provenance enabled for npm packages

**Runs:** On tag push  
**Duration:** ~3-5 minutes  

---

## Workflow Features

### ✅ Security
- Dependency audits on every run
- Minimal permissions (read-only where possible)
- Provenance for npm packages
- Version collision detection

### ✅ Quality
- Type checking before tests
- Full test suite (161 tests)
- Coverage reporting
- Build verification
- Package contents validation

### ✅ Performance
- npm cache enabled
- Parallel matrix builds
- Concurrency control
- Fast failure detection

### ✅ Reliability
- Proper error handling
- Diagnostic artifacts on failure
- Test isolation
- Clean builds

---

## Required Secrets

### For Release Workflow
- `NPM_TOKEN` - npm authentication token
  - Required for publishing to npm
  - Must have publish permissions
  - Set in repository secrets

### Auto-Provided
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
  - Used for creating releases
  - No manual setup needed

---

## Workflow Status Badges

Add to your README:

```markdown
![CI](https://github.com/ameshkin/payload-patrol/workflows/PR%20CI/badge.svg)
![Main CI](https://github.com/ameshkin/payload-patrol/workflows/Main%20CI/badge.svg)
```

---

## Manual Triggers

Workflows can be manually triggered via GitHub Actions UI:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"

---

## Troubleshooting

### Tests Failing
- Check test output in Actions logs
- Download diagnostic artifacts
- Verify Node version compatibility

### Build Failing
- Check TypeScript errors
- Verify all dependencies installed
- Check dist/ directory contents

### Release Failing
- Verify tag format (v*.*.*)
- Check version matches package.json
- Ensure version not already published
- Verify NPM_TOKEN secret is set

---

## Best Practices

1. **Always run tests locally** before pushing
2. **Check workflows** before merging PRs
3. **Verify tag format** before creating releases
4. **Review release notes** before publishing
5. **Monitor workflow runs** for failures

---

## Status

✅ All workflows configured  
✅ All tests passing  
✅ Build system working  
✅ Release pipeline ready  

**Ready for production use!** 🚀

