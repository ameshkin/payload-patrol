import type { CheckFn } from "../../../types";

export const limitCheck: CheckFn = (value, ctx) => {
  const maxChars = ctx?.limit?.maxChars ?? 0;
  const maxWords = ctx?.limit?.maxWords ?? 0;
  const words = value.trim().split(/\s+/).filter(Boolean);
  const charFail = maxChars > 0 && value.length > maxChars;
  const wordFail = maxWords > 0 && words.length > maxWords;

  return {
    name: "limit",
    ok: !charFail && !wordFail,
    message: charFail
      ? `Too long (${value.length}/${maxChars} chars).`
      : wordFail
        ? `Too many words (${words.length}/${maxWords}).`
        : undefined,
    details: { length: value.length, words: words.length, maxChars, maxWords },
  };
};
