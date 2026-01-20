import { HomePage, CTASection } from "onedocs";
import config from "../../onedocs.config";

export default function Home() {
  return (
    <HomePage config={config} packageName="termbridge">
      <CTASection
        title="Ready to beam?"
        description="Get started with Termbridge in minutes."
        cta={{ label: "Read the Docs", href: "/docs" }}
      />
    </HomePage>
  );
}
