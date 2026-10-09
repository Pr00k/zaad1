import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { PageTitle } from "@/components/zad/ui";

export const Route = createFileRoute("/reminders")({
  head: () => ({ meta: [{ title: "زاد — reminders" }, { name: "description", content: "زاد — reminders" }, { property: "og:title", content: "زاد — reminders" }, { property: "og:description", content: "زاد — reminders" }] }),
  component: Page,
});

function Page() {
  const { t } = useT();
  return <PageTitle title={t.reminders} />;
}
