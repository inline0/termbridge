import { HomePage, CTASection } from "onedocs";
import { createFileRoute } from "@tanstack/react-router";
import config from "../../onedocs.config";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomePage config={config} packageName="termbridge">
      <CTASection
        title="Ready to beam your terminal?"
        description="Start with the quick setup and launch your first session."
        cta={{ label: "Get Started", href: "/docs/getting-started" }}
      />
    </HomePage>
  );
}
