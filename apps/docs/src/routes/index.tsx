import { HomePage, CTASection, highlightInstallCommands } from "onedocs";
import { createFileRoute } from "@tanstack/react-router";
import config from "../../onedocs.config";

export const Route = createFileRoute("/")({
  loader: async () => {
    const installCommands = await highlightInstallCommands("termbridge");
    return { installCommands };
  },
  component: Home,
});

function Home() {
  const { installCommands } = Route.useLoaderData();
  return (
    <HomePage config={config} installCommands={installCommands}>
      <CTASection
        title="Ready to beam your terminal?"
        description="Start with the quick setup and launch your first session."
        cta={{ label: "Get Started", href: "/docs/getting-started" }}
      />
    </HomePage>
  );
}
