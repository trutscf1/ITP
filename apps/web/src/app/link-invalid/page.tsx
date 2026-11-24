import type { ReactElement } from "react";
import { LinkInvalidPageView } from "../../auth/pages.ts";
import { requestLanguage } from "../../auth/request.ts";

// `/link-invalid` (M8): where `identity` sends an unknown, used, or expired link (IDN-U-7).
export default async function LinkInvalidPage({
  searchParams,
}: PageProps<"/link-invalid">): Promise<ReactElement> {
  const language = await requestLanguage();
  const { kind } = await searchParams;
  return (
    <LinkInvalidPageView
      language={language}
      kind={kind === "confirm" ? "confirm" : "other"}
    />
  );
}
