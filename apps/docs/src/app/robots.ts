import { generateRobots } from "onedocs/seo";

const baseUrl = "https://termbridge.dev";

export default function robots() {
  return generateRobots({ baseUrl });
}
