import * as fs from "node:fs/promises";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


const server = new McpServer({
  name: "fs",
  version: "1.0.0",
});


server.registerTool(
  "list_files",
  {
    title: "List Files",
    description: "List files and directories at a given path",
    inputSchema: {
      path: z.string().optional().describe("Path to directory to list content of it (defaults to current directory)")
    }
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

server.registerTool(
  "read_file",
  {
    title: "Read File",
    description: "Read the content of a file at a given path",
    inputSchema: {
      path: z.string().describe("Path to file to read")
    }
  },
  async ({path}) => {
    try {
      const content = await fs.readFile(path, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: content
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading file: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

server.registerTool(
  "write_file",
  {
    title: "Write File",
    description: "Write content to a file at a given path",
    inputSchema: {
      path: z.string().describe("Path to file to write"),
      content: z.string().describe("Content to write to the file")
    }
  },
  async ({path, content}) => {
    try {
      await fs.writeFile(path, content, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: `Successfully wrote to file: ${path}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error writing file: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("fs MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});