import { registerCheck } from "../registry";
import { badwordsCheck } from "./badwords";
import { sqlCheck } from "./sql";
import { scriptsCheck } from "./scripts";
import { htmlCheck } from "./html";
import { limitCheck } from "./limit";

export function registerBuiltins() {
  registerCheck("badwords", badwordsCheck);
  registerCheck("sql", sqlCheck);
  registerCheck("scripts", scriptsCheck);
  registerCheck("html", htmlCheck);
  registerCheck("limit", limitCheck);
}
