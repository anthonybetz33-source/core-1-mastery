import { createFileRoute, redirect } from "@tanstack/react-router";
import { isPanelId } from "@/lib/nav";
import { PanelSwitch } from "@/views/PanelSwitch";

export const Route = createFileRoute("/_app/$panel")({
  beforeLoad: ({ params }) => {
    if (params.panel === "home" || !isPanelId(params.panel)) {
      throw redirect({ to: "/" });
    }
  },
  component: PanelPage,
});

function PanelPage() {
  const { panel } = Route.useParams();
  if (!isPanelId(panel)) return null;
  return <PanelSwitch panel={panel} />;
}
