import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "../server.js";

async function startStdioServer() {
  const transport = new StdioServerTransport();
  const server = createServer();

  await server.server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await server.server.close();
    process.exit(0);
  });
}

startStdioServer().catch((error) => {
  console.error("Stdio server error:", error);
  process.exit(1);
});