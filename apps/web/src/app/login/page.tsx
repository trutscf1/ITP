import type { ReactElement } from "react";
import { LoginPageView } from "../../auth/pages.ts";
import { requestLanguage } from "../../auth/request.ts";

// `/login` (M8): the notice after a confirmation (IDN-U-8); the form follows with #169.
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">): Promise<ReactElement> {
  const language = await requestLanguage();
  const { confirmed } = await searchParams;
  return <LoginPageView language={language} confirmed={confirmed === "1"} />;
}
