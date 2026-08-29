import { createFileRoute } from "@tanstack/react-router";
import { PanelSwitch } from "@/views/PanelSwitch";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  return <PanelSwitch panel="home" />;
}
