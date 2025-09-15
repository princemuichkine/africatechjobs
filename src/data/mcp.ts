export interface MCP {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  // Add other MCP properties as needed
}

export const mcps: MCP[] = [
  // Placeholder MCPs - can be adapted for tech companies or job categories
  {
    id: "1",
    name: "Tech Company A",
    description: "Leading tech company in Africa",
    logo: "/placeholder-logo.png",
  },
];
