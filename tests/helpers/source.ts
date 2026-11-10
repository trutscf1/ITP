/**
 * Removes line comments and block comments from TypeScript or JSX source; strings, template literals, and
 * regular-expression literals stay as they are, so a `//` inside them is not taken for a comment.
 * Mirrors `withoutComments` of `gam-ai-knowledge/tools/doc-check.mjs`, so a test only sees code.
 */
export function withoutComments(source: string): string {
  let out = "";
  let index = 0;
  // The last significant character outside strings and comments tells a regular expression from a division.
  let last = "";
  while (index < source.length) {
    const char = source[index] as string;
    const next = source[index + 1];
    if (char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
    } else if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      index = end < 0 ? source.length : end + 2;
    } else if (
      char === '"' ||
      char === "'" ||
      char === "`" ||
      (char === "/" && (last === "" || "(,=:[!&|?{};+-*%<>~^".includes(last)))
    ) {
      let end = index + 1;
      let inClass = false;
      while (end < source.length) {
        const inner = source[end];
        if (inner === "\\") end += 1;
        else if (char === "/" && inner === "[") inClass = true;
        else if (char === "/" && inner === "]") inClass = false;
        else if (inner === char && !inClass) break;
        else if (char !== "`" && inner === "\n") break;
        end += 1;
      }
      out += source.slice(index, end + 1);
      index = end + 1;
      last = char;
    } else {
      out += char;
      if (!/\s/.test(char)) last = char;
      index += 1;
    }
  }
  return out;
}

/**
 * The opening tag around the first `needle` in `source`, from its `<` to its closing `>`. A `>`
 * inside a quoted attribute value or a `{…}` expression does not end the tag.
 */
export function openingTag(source: string, needle: string): string {
  const at: number = source.indexOf(needle);
  if (at < 0) throw new Error(`${needle} not found`);
  const start: number = source.lastIndexOf("<", at);
  let quote: string | null = null;
  let braces = 0;
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index] as string;
    if (quote !== null) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") braces += 1;
    else if (char === "}") braces -= 1;
    else if (char === ">" && braces === 0)
      return source.slice(start, index + 1);
  }
  throw new Error(`the tag around ${needle} is not closed`);
}
