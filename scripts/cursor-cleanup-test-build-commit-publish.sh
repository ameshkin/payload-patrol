#!/usr/bin/env bash

# CURSOR – GENERAL CLEANUP + TEST + BUILD + COMMIT + PUBLISH (GITHUB PACKAGES)
#
# Use this as the standard pipeline for any npm package in this repo.


#######################################
# 1) INSTALL DEPENDENCIES (ALWAYS FIRST)
#######################################

# Detect package manager and install.
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install
elif [ -f "yarn.lock" ]; then
  yarn install
else
  npm install
fi


#######################################
# 2) RUN TESTS (AND FIX UNTIL CLEAN)
#######################################

# If "test" script exists in package.json, run it.
# Cursor: if tests fail, read errors, fix code, and re-run until clean.
npm run test || pnpm test || yarn test


#######################################
# 3) RUN BUILD (AND FIX UNTIL CLEAN)
#######################################

# If "build" script exists, run it.
# Cursor: if build fails, read errors, fix code, and re-run until clean.
npm run build || pnpm build || yarn build


#######################################
# 4) GIT – COMMIT & PUSH CHANGES
#######################################

# Only if tests + build pass.
git status
git add .
git commit -m "chore: clean install, tests, and build"
git push


#######################################
# 5) PUBLISH TO GITHUB PACKAGES
#######################################

# Assumes:
#   - package.json has "name": "@scope/pkg"
#   - .npmrc points to npm.pkg.github.com
#   - GITHUB_TOKEN is set and valid.
#
# If there is a custom script, use it:
#   npm run publish:github || pnpm publish:github || yarn publish:github
# Else fall back to direct npm publish.
npm publish --registry=https://npm.pkg.github.com || \
pnpm publish --registry=https://npm.pkg.github.com || \
yarn publish --registry=https://npm.pkg.github.com


#######################################
# 6) SUMMARY
#######################################

# Cursor:
# - Fix ALL test and build errors you encounter.
# - Do not skip failing steps.
# - Only commit, push, and publish when tests + build succeed.
echo "✅ Done: install, tests, build, commit, push, and publish (GitHub Packages)."


