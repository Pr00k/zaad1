import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { PageTitle } from "@/components/zad/ui";

export const Route = createFileRoute("/vaults")({
  head: () => ({ meta: [{ title: "زاد — vaults" }, { name: "description", content: "زاد — vaults" }, { property: "og:title", content: "زاد — vaults" }, { property: "og:description", content: "زاد — vaults" }] }),
  component: Page,
});

function Page() {
  const { t } = useT();
  return <PageTitle title={t.vaults} />;
}
