# Installing @ameshkin/payload-patrol in Your Project

Since `@ameshkin/payload-patrol` is published to GitHub Packages as a private package, you need to configure npm authentication.

## Quick Setup

### Option 1: Using npm login (Recommended)

1. **Authenticate with GitHub Packages:**
   ```bash
   npm login --scope=@ameshkin --registry=https://npm.pkg.github.com
   ```
   
   When prompted:
   - **Username:** Your GitHub username
   - **Password:** Your GitHub Personal Access Token (PAT)
   - **Email:** Your GitHub email

2. **Create `.npmrc` in your project root:**
   ```ini
   @ameshkin:registry=https://npm.pkg.github.com
   ```

3. **Install the package:**
   ```bash
   npm install
   ```

### Option 2: Using Environment Variable

1. **Create `.npmrc` in your project root:**
   ```ini
   @ameshkin:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

2. **Set the token:**
   ```bash
   export GITHUB_TOKEN=your_pat_token_here
   ```

3. **Install the package:**
   ```bash
   npm install
   ```

## For CI/CD (GitHub Actions)

Add this to your `.github/workflows/*.yml`:

```yaml
- name: Configure npm for GitHub Packages
  run: |
    echo "@ameshkin:registry=https://npm.pkg.github.com" >> .npmrc
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc

- name: Install dependencies
  run: npm ci
```

Or use the built-in `GITHUB_TOKEN` (if the repo has access):
```yaml
- name: Configure npm
  run: |
    echo "@ameshkin:registry=https://npm.pkg.github.com" >> .npmrc
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc
```

## Security Notes

- **Never commit your PAT token to the repo**
- Add `.npmrc` to `.gitignore` if it contains tokens
- Use GitHub Actions secrets for CI/CD
- The `.npmrc` file with `${GITHUB_TOKEN}` is safe to commit (it uses env var)

