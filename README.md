# Payload Patrol

Minimal, framework-agnostic input defense for web apps and APIs, with optional **super-components** for React/MUI that ship battle-tested UX patterns (phone, email, text) and built-in validation.

* Detects common **SQLi/XSS** patterns
* **Custom deny rules** and **optional profanity** checks
* **Zod adapter** for schema-level validation
* **Headless core** usable in Node/Edge runtimes
* **UI layer (optional):** thin MUI wrappers like `<Phone />`, `<Text />` that add formatting, country pickers, masks, profanity filters, etc.

> Design principle: **Headless first.** All validation lives in the core; UI packages are opt-in wrappers so you can swap MUI for any other UI kit later.

---

## Install

```bash
npm i @ameshkin/payload-patrol
# optional peers
npm i zod
# if you’ll use the Phone component (UI wrapper)
npm i libphonenumber-js
```

---

## Quick start (headless)

```ts
import { createPatrol, auditPayload, registerProfanityList } from "@ameshkin/payload-patrol";

registerProfanityList(["dang", "heck"]); // optional

const patrol = createPatrol({
  blockSQLi: true,
  blockXSS: true,
  allowHTML: false,
  limit: { maxChars: 5000, maxWords: 800 }
});

const result = patrol.scan({
  name: "<script>alert(1)</script>",
  comment: "hi -- drop table users;"
});

if (!result.ok) {
  console.log(result.issues);
  // [{ path: ["name"], rule: "xss", ...}, { path: ["comment"], rule: "sqli", ...}]
}
```

---

## Zod adapter

```ts
import { z } from "zod";
import { zSafeString } from "@ameshkin/payload-patrol/adapters/zod";

const schema = z.object({
  name: zSafeString({ maxLength: 128 }),
  email: zSafeString({ allowHTML: false })
});

schema.parse({ name: "Alice", email: "alice@example.com" }); // throws on violations
```

---

## UI Layer (optional): Super-components for React + MUI

These are **thin wrappers** around MUI that wire in our headless validation, formatting, and UX sugar. You can use them directly, or just copy patterns into your own components.

### `<Phone />` (international phone input)

A polished phone input with:

* Country flag and dropdown
* Auto-formatting as you type
* Country-aware validation
* Emits E.164 by default
* Accessible keyboard navigation
* Server-safe: works SSR/CSR

```tsx
import { Phone } from "@ameshkin/payload-patrol/react/mui";

<Phone
  country
  flag
  defaultCountry="US"
  value={phone}
  onChange={setPhone}
  label="Phone"
  helperText="Include country code"
  required
/>;
```

**Why this design?**
We build on `libphonenumber-js` for parsing/formatting/validation; it’s a lightweight rewrite of Google’s lib with smaller bundles and solid APIs, widely used in production phone inputs (e.g., `react-phone-number-input`). ([npmjs.com][1])

#### Alternatives we’ll interop/learn from

* `react-phone-number-input`: modern, flag/country select variants, uses `libphonenumber-js`. Good DX, actively used. ([npmjs.com][2])
* `react-phone-input-2`: highly customizable with country dropdown and flags; older, heavier, but popular. ([npmjs.com][3])
* `intl-tel-input` (vanilla + wrappers): classic JS plugin with country dropdown, auto-detect, placeholders, comprehensive validation. Great feature reference; we’ll avoid its CSS/JS footprint in React apps but mimic key UX. ([intl-tel-input.com][4])
* `google-libphonenumber`: authoritative upstream that powers Android; heavier than `libphonenumber-js`. ([GitHub][5])

> Goal: **reuse** proven parsing/formatting (libphonenumber) and **borrow** UX details (searchable country list, one-flag strategy to keep bundle small) from established libs. ([GitHub][6])

### `<Text />`

A text field with optional profanity check, length guard, and HTML/script stripping. Passes all MUI props through.

```tsx
import { Text } from "@ameshkin/payload-patrol/react/mui";

<Text
  label="Display name"
  profanity
  maxLength={64}
  allowHTML={false}
  value={name}
  onChange={setName}
/>
```

Shorthand (dictionary integration):

```tsx
<Text type="text" profanity />
```

> Under the hood, `Text` calls the headless `auditPayload` on every change (debounced) and can either block, warn, or strip based on `adapter` mode.

### Other planned super-components

* `<Email />` with RFC-ish validation + MX-safe client hints
* `<Password />` with strength meter and breach check hook (opt-in)
* `<Textarea />` with word/char counters and auto-sanitize
* `<URL />` with allow/deny hostname lists

---

## Architecture

* **Core (headless):** scanning/sanitization (`auditPayload`, `createPatrol`), profanity dictionary loader, adapters (Zod).
* **UI (React/MUI):** very thin wrappers that:

    1. Render an underlying MUI control,
    2. Call headless validation on value changes/blur,
    3. Map results → MUI error/HelperText, optionally mutate value when `adapter="strip"`.

This keeps validation central, enables non-React servers, and avoids lock-in.

### Should we wrap MUI or pass props into its components?

* **Best practice:** **export thin wrappers** for turnkey use **and** expose **hooks** (`usePatrolField`) so teams can wire validation into any input without wrappers.
* Wrapping every MUI control creates churn; by focusing on high-value patterns (Phone, Email, Text), we minimize surface area while offering a generic hook for everything else.

---

## API surface (core)

```ts
type AdapterMode = "block" | "warn" | "strip";

createPatrol(options?: {
  blockSQLi?: boolean;
  blockXSS?: boolean;
  allowHTML?: boolean;
  limit?: { maxChars?: number; maxWords?: number };
  allowlist?: string[];
  adapter?: AdapterMode; // default "block"
}): { scan(value: unknown, opts?: { adapter?: AdapterMode }): ScanResult };

auditPayload(value: unknown, opts?: { adapter?: AdapterMode; checks?: ...}): ScanResult;

registerProfanityList(words: string[]): void;
```

---

## API surface (React/MUI)

```tsx
// Phone
type PhoneProps = {
  country?: boolean;          // show country select
  flag?: boolean;             // show selected flag
  defaultCountry?: string;    // "US", "GB", ...
  value?: string;             // accepts E.164 or national; emits E.164 by default
  onChange?: (e164: string | undefined) => void;
  format?: "E.164" | "national" | "international";
  adapter?: "block" | "warn" | "strip";
} & MuiTextFieldProps;

// Text
type TextProps = {
  profanity?: boolean;
  allowHTML?: boolean;
  maxLength?: number;
  adapter?: "block" | "warn" | "strip";
} & MuiTextFieldProps;
```

---

## Integration examples

### With React Hook Form

```tsx
const { control } = useForm();

<Controller
  name="phone"
  control={control}
  render={({ field, fieldState }) => (
    <Phone {...field} country flag error={!!fieldState.error} helperText={fieldState.error?.message} />
  )}
/>
```

### With Zod schema

```ts
const schema = z.object({
  phone: z.string().min(1) // store E.164
});
```

---

## Extras

### Dictionary files

Put your profanity list at `data/badwords.json` and register it at startup.

```ts
import badwords from "../data/badwords.json" assert { type: "json" };
registerProfanityList(badwords);
```

### Hooks

* `usePatrolField({ value, adapter, checks })` → `{ value, setValue, issues, ok }`
* `useProfanity({ value })` → `{ flagged: boolean, tokens: string[] }`

---

## Comparison: existing phone input libraries (for reuse & reference)

| Library                    | Core parser         | Country dropdown |    Flags | Notes                                                                              |
| -------------------------- | ------------------- | ---------------: | -------: | ---------------------------------------------------------------------------------- |
| `react-phone-number-input` | `libphonenumber-js` |              Yes | Optional | Modern, two variants; good docs and patterns to reuse. ([npmjs.com][2])            |
| `react-phone-input-2`      | internal + data     |              Yes |      Yes | Very customizable, heavier/older but popular. ([npmjs.com][3])                     |
| `intl-tel-input`           | internal + utils    |              Yes |      Yes | Vanilla plugin; React wrappers exist; great UX baseline. ([intl-tel-input.com][4]) |
| `google-libphonenumber`    | Google              |              N/A |      N/A | Authoritative but heavier; we prefer `libphonenumber-js`. ([GitHub][5])            |
| `libphonenumber-js`        | Lightweight rewrite |              N/A |      N/A | Our chosen core parser/formatter to keep bundle small. ([npmjs.com][1])            |

---

## Performance & bundle size

* **Flags:** avoid shipping all SVG flags by default; show only selected country’s flag to keep bundles small (pattern used upstream). ([GitHub][6])
* **Parsing:** prefer `libphonenumber-js`’s “min metadata” build where possible. ([npmjs.com][1])

---

## Roadmap

* `@ameshkin/payload-patrol` (core) — v1
* `@ameshkin/payload-patrol/react` — hooks
* `@ameshkin/payload-patrol/react/mui` — `<Phone/>`, `<Text/>`, `<Email/>`, `<Password/>`
* **Masks:** optional integration points for card numbers, SSNs, etc.
* **Server adapters:** Hono/Express/Koa middlewares

---

## FAQ

**Is this just a MUI wrapper?**
No. The **core** is headless and framework-agnostic. The MUI layer is an optional thin wrapper for rapid adoption.

**Can I use MUI TextField directly and just add validation?**
Yes. Use the **headless hooks** or `auditPayload` in your own components. We provide `<Text/>` only to save you time.

**Can I mix and match?**
Absolutely—use `<Phone/>` for the complex UX, and plain MUI for the rest with `usePatrolField`.

---

## Links

* `data/badwords.json` (profanity dictionary you provide)
* Upstreams we reference: `libphonenumber-js`, `react-phone-number-input`, `react-phone-input-2`, `intl-tel-input`. ([npmjs.com][1])

---

If this looks good, I’ll scaffold the repo layout next:

```
/packages/core
/packages/react
/packages/react-mui
/data/badwords.json
```

…and then implement `<Phone/>`, `<Text/>`, `usePatrolField`, and the core validators exactly as specced here.

[1]: https://npmjs.com/package/libphonenumber-js/v/1.2.6?utm_source=chatgpt.com "libphonenumber-js"
[2]: https://www.npmjs.com/package/react-phone-number-input?utm_source=chatgpt.com "react-phone-number-input"
[3]: https://www.npmjs.com/package/react-phone-input-2?utm_source=chatgpt.com "react-phone-input-2"
[4]: https://intl-tel-input.com/?utm_source=chatgpt.com "International Telephone Input"
[5]: https://github.com/google/libphonenumber?utm_source=chatgpt.com "google/libphonenumber"
[6]: https://github.com/Blocknify/react-phone-number-input?utm_source=chatgpt.com "Blocknify/react-phone-number-input"
