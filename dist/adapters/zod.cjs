"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/adapters/zod.ts
var zod_exports = {};
__export(zod_exports, {
  zSafeObject: () => zSafeObject,
  zSafeString: () => zSafeString,
  zStripUnsafe: () => zStripUnsafe
});
module.exports = __toCommonJS(zod_exports);
var import_zod = require("zod");

// src/lib/checks/registry.ts
var registry = /* @__PURE__ */ new Map();
function registerCheck(name, run) {
  registry.set(name, { name, run });
}
function getCheck(name) {
  const found = registry.get(name);
  if (!found) throw new Error(`Unknown check: ${name}`);
  return found;
}

// data/en/severe.json
var severe_default = [
  "4r5e",
  "5h1t",
  "5hit",
  "a55",
  "anal",
  "anus",
  "ar5e",
  "arrse",
  "arse",
  "ass",
  "ass-fucker",
  "asses",
  "assfucker",
  "assfukka",
  "asshole",
  "assholes",
  "asswhole",
  "a_s_s",
  "b!tch",
  "b00bs",
  "b17ch",
  "b1tch",
  "ballbag",
  "ballsack",
  "bastard",
  "beastial",
  "beastiality",
  "bellend",
  "bestial",
  "bestiality",
  "bi+ch",
  "biatch",
  "bitch",
  "bitcher",
  "bitchers",
  "bitches",
  "bitchin",
  "bitching",
  "blow job",
  "blowjob",
  "blowjobs",
  "bollock",
  "bollok",
  "boob",
  "boobs",
  "booobs",
  "boooobs",
  "booooobs",
  "booooooobs",
  "buceta",
  "bugger",
  "bunny fucker",
  "butthole",
  "buttmuch",
  "buttplug",
  "c0ck",
  "c0cksucker",
  "carpet muncher",
  "cawk",
  "chink",
  "cipa",
  "cl1t",
  "clit",
  "clitoris",
  "clits",
  "cnut",
  "cock",
  "cock-sucker",
  "cockface",
  "cockhead",
  "cockmunch",
  "cockmuncher",
  "cocks",
  "cocksuck",
  "cocksucked",
  "cocksucker",
  "cocksucking",
  "cocksucks",
  "cocksuka",
  "cocksukka",
  "cok",
  "cokmuncher",
  "coksucka",
  "coon",
  "cox",
  "cum",
  "cummer",
  "cumming",
  "cums",
  "cumshot",
  "cunilingus",
  "cunillingus",
  "cunnilingus",
  "cunt",
  "cuntlick",
  "cuntlicker",
  "cuntlicking",
  "cunts",
  "cyberfuc",
  "cyberfuck",
  "cyberfucked",
  "cyberfucker",
  "cyberfuckers",
  "cyberfucking",
  "d1ck",
  "dick",
  "dickhead",
  "dildo",
  "dildos",
  "dipshit",
  "dlck",
  "dog-fucker",
  "doggin",
  "dogging",
  "donkeyribber",
  "doosh",
  "duche",
  "douchebag",
  "dyke",
  "ejaculate",
  "ejaculated",
  "ejaculates",
  "ejaculating",
  "ejaculatings",
  "ejaculation",
  "ejakulate",
  "f u c k",
  "f u c k e r",
  "f4nny",
  "fag",
  "fagging",
  "faggitt",
  "faggot",
  "faggs",
  "fagot",
  "fagots",
  "fags",
  "fanny",
  "fannyflaps",
  "fannyfucker",
  "fanyy",
  "fatass",
  "fcuk",
  "fcuker",
  "fcuking",
  "feck",
  "fecker",
  "felching",
  "fellate",
  "fellatio",
  "fingerfuck",
  "fingerfucked",
  "fingerfucker",
  "fingerfuckers",
  "fingerfucking",
  "fingerfucks",
  "fistfuck",
  "fistfucked",
  "fistfucker",
  "fistfuckers",
  "fistfucking",
  "fistfuckings",
  "fistfucks",
  "flange",
  "fook",
  "fooker",
  "fuck",
  "fucka",
  "fucked",
  "fucker",
  "fuckers",
  "fuckface",
  "fuckhead",
  "fuckheads",
  "fuckin",
  "fucking",
  "fuckings",
  "fuckingshitmotherfucker",
  "fuckme",
  "fucks",
  "fuckwhit",
  "fuckwit",
  "fudge packer",
  "fudgepacker",
  "fuk",
  "fuker",
  "fukker",
  "fukkin",
  "fuks",
  "fukwhit",
  "fukwit",
  "fux",
  "fux0r",
  "f_u_c_k",
  "gangbang",
  "gangbanged",
  "gangbangs",
  "gaylord",
  "gaysex",
  "goatse",
  "goddamn",
  "goddamned",
  "hardcoresex",
  "heshe",
  "hoar",
  "hoare",
  "hoer",
  "homo",
  "hore",
  "horniest",
  "horny",
  "hotsex",
  "jack-off",
  "jackoff",
  "jap",
  "jerk-off",
  "jism",
  "jiz",
  "jizm",
  "jizz",
  "kawk",
  "knob",
  "knobead",
  "knobed",
  "knobend",
  "knobhead",
  "knobjocky",
  "knobjokey",
  "kock",
  "kondum",
  "kondums",
  "kum",
  "kummer",
  "kumming",
  "kums",
  "kunilingus",
  "l3i+ch",
  "l3itch",
  "labia",
  "m0f0",
  "m0fo",
  "m45terbate",
  "ma5terb8",
  "ma5terbate",
  "masochist",
  "master-bate",
  "masterb8",
  "masterbat*",
  "masterbat3",
  "masterbate",
  "masterbation",
  "masterbations",
  "masturbate",
  "mo-fo",
  "mof0",
  "mofo",
  "mothafuck",
  "mothafucka",
  "mothafuckas",
  "mothafuckaz",
  "mothafucked",
  "mothafucker",
  "mothafuckers",
  "mothafuckin",
  "mothafucking",
  "mothafuckings",
  "mothafucks",
  "mother fucker",
  "motherfuck",
  "motherfucked",
  "motherfucker",
  "motherfuckers",
  "motherfuckin",
  "motherfucking",
  "motherfuckings",
  "motherfuckka",
  "motherfucks",
  "muff",
  "mutha",
  "muthafecker",
  "muthafuckker",
  "muther",
  "mutherfucker",
  "n1gga",
  "n1gger",
  "nazi",
  "nigg3r",
  "nigg4h",
  "nigga",
  "niggah",
  "niggas",
  "niggaz",
  "nigger",
  "niggers",
  "nob",
  "nob jokey",
  "nobhead",
  "nobjocky",
  "nobjokey",
  "numbnuts",
  "nutsack",
  "orgasim",
  "orgasims",
  "orgasm",
  "orgasms",
  "p0rn",
  "pecker",
  "penis",
  "penisfucker",
  "phonesex",
  "phuck",
  "phuk",
  "phuked",
  "phuking",
  "phukked",
  "phukking",
  "phuks",
  "phuq",
  "pigfucker",
  "pimpis",
  "piss",
  "pissed",
  "pisser",
  "pissers",
  "pisses",
  "pissflaps",
  "pissin",
  "pissing",
  "pissoff",
  "poop",
  "porn",
  "porno",
  "pornography",
  "pornos",
  "prick",
  "pricks",
  "pron",
  "pube",
  "pusse",
  "pussi",
  "pussies",
  "pussy",
  "pussys",
  "rectum",
  "retard",
  "rimjaw",
  "rimming",
  "s hit",
  "s.o.b.",
  "sadist",
  "schlong",
  "screwing",
  "scroat",
  "scrote",
  "scrotum",
  "semen",
  "sh!+",
  "sh!t",
  "sh1t",
  "shag",
  "shagger",
  "shaggin",
  "shagging",
  "shemale",
  "shi+",
  "shit",
  "shitbag",
  "shitdick",
  "shite",
  "shited",
  "shitey",
  "shitface",
  "shitfuck",
  "shitfull",
  "shithead",
  "shiting",
  "shitings",
  "shits",
  "shitted",
  "shitter",
  "shitters",
  "shitting",
  "shittings",
  "shitty",
  "skank",
  "slut",
  "sluts",
  "smegma",
  "smut",
  "snatch",
  "son-of-a-bitch",
  "spac",
  "spunk",
  "s_h_i_t",
  "t1tt1e5",
  "t1tties",
  "teets",
  "teez",
  "testical",
  "testicle",
  "tit",
  "titfuck",
  "tits",
  "titt",
  "tittie5",
  "tittiefucker",
  "titties",
  "tittyfuck",
  "tittywank",
  "titwank",
  "tosser",
  "turd",
  "tw4t",
  "twat",
  "twathead",
  "twatty",
  "twunt",
  "twunter",
  "v14gra",
  "v1gra",
  "vagina",
  "viagra",
  "vulva",
  "w00se",
  "wang",
  "wank",
  "wanker",
  "wanky",
  "whore",
  "xrated",
  "xxx"
];

// src/lib/checks/builtins/badwords.ts
var badwordsSevere = severe_default;
var defaultBadSet = new Set(badwordsSevere.map((w) => w.toLowerCase()));
var customBadwords = null;
var badwordsCheck = (value, ctx) => {
  const badSet = customBadwords || defaultBadSet;
  const allow = new Set((ctx?.allowlist ?? []).map((w) => w.toLowerCase()));
  const tokens = value.toLowerCase().match(/[a-z0-9@.\-_'']+/g) ?? [];
  const hits = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (allow.has(t)) continue;
    if (badSet.has(t)) hits.push(t);
  }
  const uniqueHits = Array.from(new Set(hits));
  return {
    name: "badwords",
    ok: hits.length === 0,
    message: hits.length ? `Contains blocked terms: ${uniqueHits.slice(0, 5).join(", ")}` : void 0,
    details: hits.length ? { hits: uniqueHits } : void 0
  };
};

// src/lib/checks/builtins/sql.ts
var suspicious = [
  /\bunion\b\s+\bselect\b/i,
  /\bselect\b.+\bfrom\b/i,
  /(--|#).+$/m,
  /\/\*[\s\S]*?\*\//,
  /\bor\s+1\s*=\s*1\b/i,
  /\bdrop\s+(table|database)\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\b.+\bset\b/i,
  /\bdelete\s+from\b/i,
  /\bsleep\s*\(/i,
  /\bxp_cmdshell\b/i,
  /;{2,}/
];
var sqlCheck = (value) => {
  const hits = suspicious.filter((rx2) => rx2.test(value)).map((rx2) => rx2.source).slice(0, 5);
  return {
    name: "sql",
    ok: hits.length === 0,
    message: hits.length ? "Looks like SQL or injection patterns." : void 0,
    details: hits.length ? { rules: hits } : void 0
  };
};

// src/lib/checks/builtins/scripts.ts
var rx = [
  /<\s*script\b/i,
  /\bon[a-z]+\s*=/i,
  // onclick= onload= …
  /\bjavascript\s*:/i,
  /\bdocument\./i,
  /\bwindow\./i,
  /\beval\s*\(/i
];
var scriptsCheck = (value) => {
  const hits = rx.filter((r) => r.test(value)).map((r) => r.source);
  const stripRules = [/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, /\bon[a-z]+\s*=\s*["'][^"']*["']/gi, /\bjavascript\s*:[^)\s]+/gi];
  const stripped = value.replace(stripRules[0], "").replace(stripRules[1], "").replace(stripRules[2], "");
  return {
    name: "scripts",
    ok: hits.length === 0,
    message: hits.length ? "Inline script/event handler detected." : void 0,
    details: hits.length ? { rules: hits } : void 0,
    value: stripped
    // enables adapter: 'strip'
  };
};

// src/lib/checks/builtins/html.ts
var ALLOW = /* @__PURE__ */ new Set(["b", "i", "u", "strong", "em", "br", "span"]);
var TAG_RX = /<\s*\/?\s*([a-z0-9:-]+)[^>]*>/gi;
var htmlCheck = (value) => {
  let m;
  const bad = [];
  while (m = TAG_RX.exec(value)) {
    const tag = (m[1] || "").toLowerCase();
    if (!ALLOW.has(tag)) bad.push(tag);
  }
  const uniqueBad = Array.from(new Set(bad));
  return {
    name: "html",
    ok: bad.length === 0,
    message: bad.length ? `HTML not allowed: ${uniqueBad.slice(0, 5).join(", ")}` : void 0,
    details: bad.length ? { tags: uniqueBad } : void 0
  };
};

// src/lib/checks/builtins/limit.ts
var limitCheck = (value, ctx) => {
  const maxChars = ctx?.limit?.maxChars ?? 0;
  const maxWords = ctx?.limit?.maxWords ?? 0;
  const words = value.trim().split(/\s+/).filter(Boolean);
  const charFail = maxChars > 0 && value.length > maxChars;
  const wordFail = maxWords > 0 && words.length > maxWords;
  return {
    name: "limit",
    ok: !charFail && !wordFail,
    message: charFail ? `Too long (${value.length}/${maxChars} chars).` : wordFail ? `Too many words (${words.length}/${maxWords}).` : void 0,
    details: { length: value.length, words: words.length, maxChars, maxWords }
  };
};

// src/lib/checks/builtins/sentiment.ts
var POSITIVE_WORDS = /* @__PURE__ */ new Set([
  "good",
  "great",
  "excellent",
  "amazing",
  "wonderful",
  "fantastic",
  "awesome",
  "love",
  "like",
  "happy",
  "joy",
  "pleased",
  "delighted",
  "thrilled",
  "excited",
  "brilliant",
  "perfect",
  "beautiful",
  "nice",
  "best",
  "super",
  "fabulous",
  "terrific",
  "outstanding",
  "impressive",
  "glad",
  "thank",
  "thanks",
  "appreciate",
  "enjoy",
  "fun",
  "exceeded",
  "exceeds",
  "quality"
]);
var NEGATIVE_WORDS = /* @__PURE__ */ new Set([
  "bad",
  "terrible",
  "awful",
  "horrible",
  "worst",
  "hate",
  "dislike",
  "angry",
  "sad",
  "disappointed",
  "frustrated",
  "annoyed",
  "upset",
  "unhappy",
  "poor",
  "sucks",
  "useless",
  "waste",
  "fail",
  "failed",
  "wrong",
  "problem",
  "issue",
  "concern",
  "worried",
  "fear",
  "afraid",
  "scary",
  "difficult",
  "hard",
  "confusing",
  "broken",
  "error"
]);
var INTENSIFIERS = /* @__PURE__ */ new Set([
  "very",
  "extremely",
  "really",
  "super",
  "incredibly",
  "absolutely",
  "totally",
  "completely"
]);
var NEGATIONS = /* @__PURE__ */ new Set([
  "not",
  "no",
  "never",
  "none",
  "nobody",
  "nothing",
  "neither",
  "nowhere",
  "hardly",
  "barely"
]);
function analyzeSentiment(text) {
  const tokens = text.toLowerCase().match(/[a-z']+/g) || [];
  let score = 0;
  const positive = [];
  const negative = [];
  let nextNegated = false;
  let nextIntensified = false;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let tokenScore = 0;
    if (NEGATIONS.has(token)) {
      nextNegated = true;
      continue;
    }
    if (INTENSIFIERS.has(token)) {
      nextIntensified = true;
      continue;
    }
    if (POSITIVE_WORDS.has(token)) {
      tokenScore = 1;
      positive.push(token);
    } else if (NEGATIVE_WORDS.has(token)) {
      tokenScore = -1;
      negative.push(token);
    }
    if (nextIntensified) {
      tokenScore *= 2;
      nextIntensified = false;
    }
    if (nextNegated) {
      tokenScore *= -1;
      nextNegated = false;
    }
    score += tokenScore;
  }
  const comparative = tokens.length > 0 ? score / tokens.length : 0;
  let mood;
  if (comparative < -0.1) mood = "negative";
  else if (comparative > 0.1) mood = "positive";
  else mood = "neutral";
  return {
    score,
    comparative,
    mood,
    tokens: tokens.length,
    positive,
    negative
  };
}
var sentimentCheck = (value, ctx) => {
  const analysis = analyzeSentiment(value);
  return {
    name: "sentiment",
    ok: true,
    // Always passes - informational only
    message: void 0,
    details: {
      mood: analysis.mood,
      score: analysis.score,
      comparative: analysis.comparative,
      positive: analysis.positive,
      negative: analysis.negative,
      tokens: analysis.tokens
    }
  };
};

// src/lib/checks/builtins/index.ts
function registerBuiltins() {
  registerCheck("badwords", badwordsCheck);
  registerCheck("sql", sqlCheck);
  registerCheck("scripts", scriptsCheck);
  registerCheck("html", htmlCheck);
  registerCheck("limit", limitCheck);
  registerCheck("sentiment", sentimentCheck);
}

// src/lib/checks/run.ts
async function runChecks(value, checks, ctx, opts) {
  const mode = opts?.adapter ?? "block";
  const stopOnFirstBlock = opts?.stopOnFirstBlock ?? true;
  let current = value;
  const results = [];
  for (const name of checks) {
    const { run } = getCheck(name);
    const res = await Promise.resolve(run(current, ctx));
    results.push(res);
    if (!res.ok) {
      if (mode === "strip" && typeof res.value === "string") {
        current = res.value;
        continue;
      }
      if (mode === "block" && stopOnFirstBlock) {
        return { ok: false, results, value: current };
      }
    }
  }
  const ok = results.every((r) => r.ok || mode === "strip");
  return { ok, results, value: current };
}

// src/index.ts
registerBuiltins();
function createPatrol(options = {}) {
  const {
    blockSQLi = true,
    blockXSS = true,
    allowHTML = false,
    limit,
    allowlist,
    adapter = "block",
    checkProfanity = false
  } = options;
  const checks = [];
  if (checkProfanity) {
    checks.push("badwords");
  }
  if (blockSQLi) {
    checks.push("sql");
  }
  if (blockXSS) {
    checks.push("scripts");
  }
  if (!allowHTML) {
    checks.push("html");
  }
  if (limit) {
    checks.push("limit");
  }
  const context = {
    limit,
    allowlist
  };
  const runOptions = {
    adapter,
    stopOnFirstBlock: adapter === "block"
  };
  async function scan(value, opts) {
    const scanAdapter = opts?.adapter ?? adapter;
    const scanOptions = {
      ...runOptions,
      adapter: scanAdapter
    };
    const issues = [];
    if (typeof value === "string") {
      const result = await runChecks(value, checks, context, scanOptions);
      if (!result.ok) {
        for (const r of result.results) {
          if (!r.ok) {
            issues.push({
              path: [],
              rule: r.name,
              message: r.message,
              details: r.details
            });
          }
        }
      }
      return {
        ok: result.ok,
        issues,
        value: scanAdapter === "strip" ? result.value : void 0
      };
    }
    if (Array.isArray(value)) {
      let allOk = true;
      const scannedArray = [];
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === "string") {
          const result = await runChecks(value[i], checks, context, scanOptions);
          if (!result.ok) {
            allOk = false;
            for (const r of result.results) {
              if (!r.ok) {
                issues.push({
                  path: [i],
                  rule: r.name,
                  message: r.message,
                  details: r.details
                });
              }
            }
          }
          scannedArray.push(scanAdapter === "strip" ? result.value : value[i]);
        } else if (typeof value[i] === "object") {
          const nested = await scan(value[i], opts);
          if (!nested.ok) {
            allOk = false;
            for (const issue of nested.issues) {
              issues.push({
                ...issue,
                path: [i, ...issue.path]
              });
            }
          }
          scannedArray.push(scanAdapter === "strip" ? nested.value : value[i]);
        } else {
          scannedArray.push(value[i]);
        }
      }
      return {
        ok: allOk,
        issues,
        value: scanAdapter === "strip" ? scannedArray : void 0
      };
    }
    if (value && typeof value === "object") {
      let allOk = true;
      const scannedObj = {};
      for (const [key, val] of Object.entries(value)) {
        if (typeof val === "string") {
          const result = await runChecks(val, checks, context, scanOptions);
          if (!result.ok) {
            allOk = false;
            for (const r of result.results) {
              if (!r.ok) {
                issues.push({
                  path: [key],
                  rule: r.name,
                  message: r.message,
                  details: r.details
                });
              }
            }
          }
          scannedObj[key] = scanAdapter === "strip" ? result.value : val;
        } else if (typeof val === "object") {
          const nested = await scan(val, opts);
          if (!nested.ok) {
            allOk = false;
            for (const issue of nested.issues) {
              issues.push({
                ...issue,
                path: [key, ...issue.path]
              });
            }
          }
          scannedObj[key] = scanAdapter === "strip" ? nested.value : val;
        } else {
          scannedObj[key] = val;
        }
      }
      return {
        ok: allOk,
        issues,
        value: scanAdapter === "strip" ? scannedObj : void 0
      };
    }
    return {
      ok: true,
      issues: [],
      value: scanAdapter === "strip" ? value : void 0
    };
  }
  return {
    scan
  };
}
async function auditPayload(value, options = {}) {
  const {
    adapter = "block",
    checks = ["badwords", "sql", "scripts", "html"],
    context = {}
  } = options;
  const patrol = createPatrol({
    adapter,
    blockSQLi: checks.includes("sql"),
    blockXSS: checks.includes("scripts"),
    allowHTML: !checks.includes("html"),
    checkProfanity: checks.includes("badwords"),
    limit: context.limit,
    allowlist: context.allowlist
  });
  return patrol.scan(value, { adapter });
}

// src/adapters/zod.ts
function zSafeString(opts = {}) {
  const {
    maxLength,
    minLength,
    blockSQLi = true,
    blockXSS = true,
    allowHTML = false,
    checkProfanity = false,
    maxChars,
    maxWords,
    allowlist,
    adapter = "block",
    message
  } = opts;
  let schema = import_zod.z.string();
  if (minLength !== void 0) {
    schema = schema.min(minLength);
  }
  if (maxLength !== void 0) {
    schema = schema.max(maxLength);
  }
  return schema.refine(
    async (value) => {
      const checks = [];
      if (checkProfanity) checks.push("badwords");
      if (blockSQLi) checks.push("sql");
      if (blockXSS) checks.push("scripts");
      if (!allowHTML) checks.push("html");
      if (maxChars || maxWords) checks.push("limit");
      const result = await auditPayload(value, {
        adapter,
        checks,
        context: {
          limit: { maxChars, maxWords },
          allowlist
        }
      });
      return result.ok;
    },
    {
      message: message || "Input contains unsafe content",
      // Provide detailed error via params
      params: {
        code: "unsafe_content"
      }
    }
  );
}
function zSafeObject(shape, opts = {}) {
  return import_zod.z.object(shape).refine(
    async (value) => {
      const result = await auditPayload(value, {
        adapter: opts.adapter || "block",
        checks: [
          ...opts.checkProfanity ? ["badwords"] : [],
          ...opts.blockSQLi !== false ? ["sql"] : [],
          ...opts.blockXSS !== false ? ["scripts"] : [],
          ...opts.allowHTML === false ? ["html"] : []
        ],
        context: {
          limit: { maxChars: opts.maxChars, maxWords: opts.maxWords },
          allowlist: opts.allowlist
        }
      });
      return result.ok;
    },
    {
      message: opts.message || "Object contains unsafe content",
      params: {
        code: "unsafe_content"
      }
    }
  );
}
function zStripUnsafe(opts = {}) {
  return async (value) => {
    const checks = [];
    if (opts.blockXSS !== false) checks.push("scripts");
    if (!opts.allowHTML) checks.push("html");
    const result = await auditPayload(value, {
      adapter: "strip",
      checks,
      context: {
        allowlist: opts.allowlist
      }
    });
    return result.value || value;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  zSafeObject,
  zSafeString,
  zStripUnsafe
});
//# sourceMappingURL=zod.cjs.map