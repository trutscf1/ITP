import { headers } from "next/headers";
import { type Language, pickLanguage } from "./messages.ts";

/** The language of the page for the current request (IDN-F-38, A19); only for server pages. */
export async function requestLanguage(): Promise<Language> {
  return pickLanguage((await headers()).get("accept-language"));
}
