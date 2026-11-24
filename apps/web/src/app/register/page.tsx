import { connection } from "next/server.js";
import type { ReactElement } from "react";
import { RegisterPageView } from "../../auth/pages.ts";
import { requestLanguage } from "../../auth/request.ts";
import { registrationSettings } from "../../auth/settings.ts";

// `/register` (M8, IDN-US-1 slice 2). connection() renders it per request, so a changed
// REGISTRATION_ENABLED or CAPTCHA_ENABLED applies without a new build.
export default async function RegisterPage(): Promise<ReactElement> {
  await connection();
  const language = await requestLanguage();
  const { open, siteKey } = registrationSettings(process.env);
  return <RegisterPageView language={language} open={open} siteKey={siteKey} />;
}
