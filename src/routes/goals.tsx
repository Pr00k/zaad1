import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { PageTitle } from "@/components/zad/ui";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "زاد — goals" }, { name: "description", content: "زاد — goals" }, { property: "og:title", content: "زاد — goals" }, { property: "og:description", content: "زاد — goals" }] }),
  component: Page,
});

function Page() {
  const { t } = useT();
  return <PageTitle title={t["goals" === "expenses" ? "expense" : "goals"] as string} />;
}
