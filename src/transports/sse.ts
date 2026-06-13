import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { hostHeaderValidation } from "@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js";
import express from "express";
import { createServer } from "../server.js";

const DEFAULT_ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

function getAllowedHosts() {
  const hosts = (process.env.MCP_ALLOWED_HOSTS ?? DEFAULT_ALLOWED_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return hosts.length > 0 ? hosts : DEFAULT_ALLOWED_HOSTS;
}

async function startSseServer() {
  const app = express();
  const transports = new Map<string, SSEServerTransport>();

  app.use(hostHeaderValidation(getAllowedHosts()));

  app.get("/sse", async (req, res) => {
    console.log("Received connection");

    let sessionId: string | undefined;

    try {
      const transport = new SSEServerTransport("/message", res);
      const transportSessionId = transport.sessionId;
      sessionId = transportSessionId;
      transports.set(transportSessionId, transport);

      transport.onclose = () => {
        transports.delete(transportSessionId);
      };

      const server = createServer();
      await server.server.connect(transport);
    } catch (error) {
      if (sessionId) {
        transports.delete(sessionId);
      }

      console.error("Error establishing SSE connection:", error);
      if (!res.headersSent) {
        res.status(500).send("Error establishing SSE connection");
      }
    }
  });

  app.post("/message", async (req, res) => {
    console.log("Received message");

    const sessionId = Array.isArray(req.query.sessionId)
      ? req.query.sessionId[0]
      : req.query.sessionId;

    if (typeof sessionId !== "string") {
      res.status(400).send("Missing sessionId parameter");
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.status(404).send("Session not found");
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
    } catch (error) {
      console.error("Error handling SSE message:", error);
      if (!res.headersSent) {
        res.status(500).send("Error handling SSE message");
      }
    }
  });

  const PORT = Number(process.env.PORT || 3001);
  const HOST = process.env.HOST;
  const listenCallback = () => {
    console.log(`Server is running on ${HOST ? `${HOST}:` : "port "}${PORT}`);
  };
  const httpServer = HOST
    ? app.listen(PORT, HOST, listenCallback)
    : app.listen(PORT, listenCallback);

  httpServer.on("error", (error) => {
    console.error("SSE server listen error:", error);
    process.exit(1);
  });

  process.on("SIGINT", async () => {
    for (const transport of transports.values()) {
      await transport.close();
    }
    httpServer.close();
    process.exit(0);
  });
};

startSseServer().catch((error) => {
  console.error("SSE server error:", error);
  process.exit(1);
});
