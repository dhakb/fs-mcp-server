import * as fs from "node:fs/promises";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


const server = new McpServer({
  name: "fs",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {}
  }
});


server.tool(
  "list_files",
  "List files and directories at a given path",
  {
    path: z.string().describe("Path to directory to list content of it (defaults to current directory)")
  },
  async ({path}) => {
    try {
      const content = await fs.readdir(
        path || "./",
        {withFileTypes: true}
      );
      const contentList = content.map((c) => ({
        name: c.name,
        isDirectory: c.isDirectory(),
        isFile: c.isFile(),
        isSymbolicLink: c.isSymbolicLink()
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(contentList, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing files: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});