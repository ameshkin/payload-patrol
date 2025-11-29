# Publishing @ameshkin/payload-patrol to GitHub Packages

This guide explains how to publish the `@ameshkin/payload-patrol` package to GitHub Packages as a private package.

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Create a token at: https://github.com/settings/tokens
   - Required scopes: `read:packages`, `write:packages`
   - Save the token securely

2. **Set up GITHUB_TOKEN environment variable**

   **macOS/Linux:**
   ```bash
   export GITHUB_TOKEN=your_github_personal_access_token_here
   ```
   
   **Windows (PowerShell):**
   ```powershell
   $env:GITHUB_TOKEN="your_github_personal_access_token_here"
   ```
   
   **Windows (CMD):**
   ```cmd
   set GITHUB_TOKEN=your_github_personal_access_token_here
   ```

   **For persistent setup, add to your shell profile:**
   - `~/.zshrc` (macOS with zsh)
   - `~/.bashrc` (Linux)
   - Or use a `.env` file (make sure it's in `.gitignore`)

## Configuration

The project is already configured with:
- `.npmrc` file that uses `${GITHUB_TOKEN}` environment variable
- `package.json` with `publishConfig` pointing to GitHub Packages
- Publishing scripts in `package.json`

## Publishing

### Quick Publish

```bash
# Make sure GITHUB_TOKEN is set
export GITHUB_TOKEN=your_token_here

# Build, test, and publish
npm run publish:github
```

### Versioned Release

```bash
# Patch release (0.0.5 -> 0.0.6)
npm run release:patch

# Minor release (0.0.5 -> 0.1.0)
npm run release:minor

# Major release (0.0.5 -> 1.0.0)
npm run release:major
```

These commands will:
1. Ensure working directory is clean
2. Bump version in `package.json`
3. Create git commit and tag
4. Push to remote
5. Build and test
6. Publish to GitHub Packages

### Dry Run (Test Before Publishing)

```bash
# Check what will be published
npm run publish:check
```

## Verification

After publishing, verify the package is available:

```bash
npm view @ameshkin/payload-patrol
```

## Troubleshooting

### Error: "You must provide a GITHUB_TOKEN"

Make sure the `GITHUB_TOKEN` environment variable is set:
```bash
echo $GITHUB_TOKEN  # Should show your token
```

### Error: "Authentication failed"

1. Verify your token has the correct scopes (`read:packages`, `write:packages`)
2. Check if the token has expired
3. Ensure the token has access to the `ameshkin` organization

### Error: "Package already exists"

The version you're trying to publish already exists. Either:
- Bump the version in `package.json`
- Use a different version number

## CI/CD

For GitHub Actions, use the built-in `GITHUB_TOKEN`:

```yaml
- name: Configure npm for GitHub Packages
  run: |
    echo "@ameshkin:registry=https://npm.pkg.github.com" >> .npmrc
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc

- name: Publish
  run: npm run publish:github
```

Note: The built-in `GITHUB_TOKEN` may need additional permissions. If it doesn't work, create a PAT and add it as a repository secret.

