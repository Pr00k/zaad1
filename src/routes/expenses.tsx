import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { PageTitle } from "@/components/zad/ui";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "زاد — expenses" }, { name: "description", content: "زاد — expenses" }, { property: "og:title", content: "زاد — expenses" }, { property: "og:description", content: "زاد — expenses" }] }),
  component: Page,
});

function Page() {
  const { t } = useT();
  return <PageTitle title={t.expense} />;
}
