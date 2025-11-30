# Contributing to Payload Patrol

Thank you for your interest in contributing to Payload Patrol! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/payload-patrol.git
   cd payload-patrol
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build the project
npm run build

# Type check without building
npm run typecheck
```

### Code Style

- Use TypeScript with strict mode
- Follow existing code patterns
- Run `npm run typecheck` before committing
- Ensure all tests pass

## Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following the project structure:
   - Core logic: `src/lib/checks/`
   - Adapters: `src/adapters/`
   - Types: `src/types.ts`
   - Tests: Co-located with source files (`.test.ts`)

3. **Write tests** for new features or bug fixes

4. **Update documentation** if needed:
   - README.md for major features
   - `.docs/features/` for detailed guides
   - Examples in `examples/` directory

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"  # or "fix: fix bug"
   ```

## Pull Request Process

1. **Ensure all tests pass**:
   ```bash
   npm run test:run
   npm run build
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure CI checks pass

4. **Respond to feedback** and make requested changes

## Project Structure

```
payload-patrol/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts               # TypeScript types
│   ├── internal.ts            # Internal utilities
│   ├── adapters/              # Framework adapters
│   │   ├── zod.ts
│   │   ├── express.ts
│   │   └── hono.ts
│   └── lib/
│       └── checks/            # Core validation checks
│           ├── builtins/      # Built-in checks
│           ├── registry.ts    # Check registry
│           └── run.ts         # Check runner
├── data/                      # Profanity word lists
├── examples/                  # Usage examples
├── docs/                      # Documentation
└── .docs/features/            # Feature documentation
```

## Adding New Checks

To add a new validation check:

1. Create the check function in `src/lib/checks/builtins/`:
   ```typescript
   import type { CheckContext, CheckResult } from '../../types';
   
   export function myCheck(context: CheckContext): CheckResult {
     // Your check logic
     return {
       ok: true, // or false
       rule: 'my-check',
       message: 'Optional message'
     };
   }
   ```

2. Register it in `src/lib/checks/builtins/index.ts`

3. Add tests in `src/lib/checks/builtins/my-check.test.ts`

4. Update documentation

## Adding New Adapters

To add support for a new framework:

1. Create adapter file in `src/adapters/`
2. Export the adapter function
3. Add to `package.json` exports
4. Create tests and examples
5. Update README.md

## Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, etc.)

## Feature Requests

1. Check existing issues and roadmap
2. Create an issue describing:
   - Use case
   - Proposed solution
   - Benefits

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Follow the project's coding standards

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Payload Patrol! 🎉

