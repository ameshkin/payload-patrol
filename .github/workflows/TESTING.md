# Testing Strategy in GitHub Actions

## Test Types Covered

### 1. **Unit Tests**
- Location: `src/lib/checks/**/*.test.ts`
- Examples:
  - `builtins.test.ts` - Core security checks (SQL, XSS, HTML, badwords, limit)
  - `registry.test.ts` - Check registration system
  - `run.test.ts` - Check execution engine
  - `sentiment.test.ts` - Sentiment analysis

### 2. **Integration Tests**
- Location: `src/**/*.integration.test.ts`
- Examples:
  - `index.integration.test.ts` - Full API integration
  - `run.integration.test.ts` - Check execution integration
  - `badwords.integration.test.ts` - Multi-language profanity filtering

### 3. **Adapter Tests**
- Location: `src/adapters/**/*.test.ts`
- Examples:
  - `zod.test.ts` - Zod schema integration
  - `express.test.ts` - Express middleware
  - `hono.test.ts` - Hono middleware

### 4. **Smoke Tests**
- Location: `src/**/*.test.ts` (non-integration)
- Examples:
  - `types.test.ts` - Type system validation
  - `index.test.ts` - Core API smoke tests
  - `internal.test.ts` - Internal utilities

## Workflow Structure

### Main Push (Direct to Main)
**File:** `.github/workflows/main-push.yml`

**Jobs:**
1. **lint_and_typecheck** - Fast feedback
   - Dependency audit
   - TypeScript type checking
   - Linting (if available)

2. **all_tests** - Comprehensive testing
   - All unit tests
   - All integration tests
   - All adapter tests
   - All smoke tests
   - Test summary reporting

3. **coverage_and_build** - Final validation
   - Coverage reporting
   - Build verification
   - Package contents validation
   - Codecov upload

**Features:**
- ✅ Allows direct pushes to main
- ✅ Parallel job execution for speed
- ✅ Comprehensive test coverage
- ✅ Build verification
- ✅ Artifact upload on failure

### PR CI
**File:** `.github/workflows/main-pr.yml`

**Jobs:**
1. **lint_and_typecheck** - Fast feedback
   - Same as main push

2. **test_matrix** - Multi-version testing
   - Node 18.x, 20.x, 22.x
   - All test types
   - Coverage on Node 22.x only
   - Build verification
   - Codecov upload

**Features:**
- ✅ Multi-version compatibility testing
- ✅ Comprehensive test coverage
- ✅ Parallel matrix execution
- ✅ Fast failure detection

## Test Execution

### Running Tests Locally

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Watch mode
npm test
```

### Test Categories

All tests are automatically discovered and run:
- **Unit tests**: `src/lib/checks/**/*.test.ts`
- **Integration tests**: `src/**/*.integration.test.ts`
- **Adapter tests**: `src/adapters/**/*.test.ts`
- **Smoke tests**: `src/**/*.test.ts` (non-integration)

### Current Test Count

- **Total Test Files**: 13
- **Total Tests**: 161
- **Coverage**: Enabled with v8 provider

## Direct Push to Main

✅ **Enabled** - The workflow is configured to allow direct pushes to main branch.

The workflow will:
1. Run all checks automatically
2. Provide fast feedback
3. Block merge if tests fail (via status checks)
4. Upload diagnostics on failure

## Status Checks

When pushing to main, the following checks must pass:
- ✅ `lint_and_typecheck` - Type checking and linting
- ✅ `all_tests` - All test suites
- ✅ `coverage_and_build` - Build and coverage

## Failure Handling

On failure:
- Diagnostic artifacts are uploaded
- Coverage reports are preserved
- Build artifacts are saved
- Error logs are captured

## Best Practices

1. **Run tests locally** before pushing
2. **Check workflow status** after push
3. **Review artifacts** if tests fail
4. **Fix issues** before merging PRs
5. **Monitor coverage** trends

---

**Last Updated**: 2024-11-22
**Test Framework**: Vitest 4.x
**Coverage Provider**: v8

