import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { PageTitle } from "@/components/zad/ui";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "زاد — settings" }, { name: "description", content: "زاد — settings" }, { property: "og:title", content: "زاد — settings" }, { property: "og:description", content: "زاد — settings" }] }),
  component: Page,
});

function Page() {
  const { t } = useT();
  return <PageTitle title={t["settings" === "expenses" ? "expense" : "settings"] as string} />;
}
