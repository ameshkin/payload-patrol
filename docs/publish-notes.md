# NPM Publish Notes

## Local environment (Node + npm)

- Node version: (will be filled in)
- npm version: (will be filled in)

## Original Error

- Error code: `EUSAGE`
- Error message: `Automatic provenance generation not supported for provider: null`

This error occurs when npm tries to generate provenance attestations but the CI/CD provider is not detected (running from local dev machine).

## Solution

Disable provenance for local publishes by:
1. Setting `provenance=false` in `.npmrc`
2. Setting `provenance: false` in `package.json` `publishConfig`
3. Adding `--provenance=false` flag to publish scripts

