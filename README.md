

# Unichat MCP Server in TypeScript
Also available in [Python](https://github.com/amidabuddha/unichat-mcp-server)
--
 <h4 align="center">
  <a href="https://glama.ai/mcp/servers/ub2u8wtbbv"><img width="380" height="200" src="https://glama.ai/mcp/servers/ub2u8wtbbv/badge" alt="unichat-ts-mcp-server MCP server" /></a>
  <a href="https://mseep.ai/app/amidabuddha-unichat-ts-mcp-server"><img width="380" height="200" src="https://mseep.net/pr/amidabuddha-unichat-ts-mcp-server-badge.png" alt="MseeP.ai Security Assessment Badge" /></a>
  <a href="https://smithery.ai/server/unichat-ts-mcp-server"><br>
  <img src="https://smithery.ai/badge/unichat-ts-mcp-server" alt="Smithery Server Installations" />
  </a>
</h4>

Send requests to OpenAI, MistralAI, Anthropic, xAI, Google AI or DeepSeek using MCP protocol via tool or predefined prompts. Vendor API key required.

Both STDIO and SSE transport mechanisms supported via arguments.



### Tools

The server implements one tool:
- `unichat`: Send a request to unichat
  - Takes "messages" as required string arguments
  - Returns a response

### Prompts

- `code_review`
  - Review code for best practices, potential issues, and improvements
  - Arguments:
    - `code` (string, required): The code to review"
- `document_code`
  - Generate documentation for code including docstrings and comments
  - Arguments:
    - `code` (string, required): The code to comment"
- `explain_code`
  - Explain how a piece of code works in detail
  - Arguments:
    - `code` (string, required): The code to explain"
- `code_rework`
  - Apply requested changes to the provided code
  - Arguments:
    - `changes` (string, optional): The changes to apply"
    - `code` (string, required): The code to rework"

## Development

### Clean installation from source

Prerequisites: Git, Node.js and npm. Use Node.js 24 to match the repository's publishing workflow; `package.json` does not declare a supported Node.js version range. Include development dependencies when installing, since the build requires TypeScript.

Clone the repository and restore dependencies from the committed `package-lock.json`:

```bash
git clone https://github.com/amidabuddha/unichat-ts-mcp-server.git
cd unichat-ts-mcp-server
npm ci
```

`npm ci` automatically runs `prepare`, which invokes `npm run build`. That script removes the generated `build/` directory, compiles `src/` into `build/` using `tsconfig.json`, and marks `build/index.js` executable. With lifecycle scripts enabled (the default), no separate first build is needed. Keep `package-lock.json` and install development dependencies; do not use `--ignore-scripts` or `--omit=dev` for this workflow.

Before running, set `UNICHAT_MODEL` and `UNICHAT_API_KEY` in the process environment, or use the MCP client's `env` configuration shown under [Installing manually](#installing-manually). Replace both placeholders with a supported model and its vendor API key. For example, in a POSIX shell:

```bash
export UNICHAT_MODEL="YOUR_PREFERRED_MODEL_NAME"
export UNICHAT_API_KEY="YOUR_VENDOR_API_KEY"
node build/index.js --stdio
```

The server reads the process environment; it does not automatically load `.env` files. STDIO expects an MCP client to communicate with the process. To run the local build over SSE instead, use `node build/index.js --sse` (default endpoint: `http://localhost:3001/sse`). See the SSE host configuration below for remote access.

### Normal development

Run all commands from the repository root. For automatic recompilation as source files change:

```bash
npm run watch
```

This runs `tsc --watch`, which recompiles affected files during the watch session. It does not start or restart the server. After compilation, restart the server or reconnect the MCP client so it launches the updated build, using the environment setup above.

For a one-off build:

```bash
npm run build
```

This script always recreates `build/`; use watch mode for incremental recompilation during editing. Ordinary source changes do not require deleting dependencies or reinstalling everything. If dependency manifests and the lockfile change after pulling updates, run `npm ci` again.

There is no automated test script in `package.json`. The build performs TypeScript checking; for manual MCP checks after building, run `npm run inspector` with the required environment variables set, as described under [Debugging](#debugging).

### Clean rebuild of an existing checkout

Stop any running watcher and server first. From the repository root, restore locked dependencies and rebuild from scratch:

```bash
npm ci
```

`npm ci` replaces `node_modules/` itself, then `prepare` runs the build script, which deletes and regenerates only `build/`. This also works when either or both directories have already been removed. No separate deletion or second build command is needed.

If dependencies are already installed and match the lockfile, and only generated output needs a clean rebuild, run:

```bash
npm run build
```

These workflows preserve `src/`, configuration, `.env` files, user data outside the generated directories, and `package-lock.json`. Keep only generated files in `build/`. Do not use `git clean` or clear global npm caches or toolchains for a project rebuild.

### Publishing

Publishing is a separate release action. The repository's [publishing workflow](.github/workflows/publish.yml) uses `npm publish` after installation and building. Local installation, development and clean rebuilds do not require publishing.

## Installation

### Installing via Smithery

To install Unichat MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/unichat-ts-mcp-server):

```bash
npx -y @smithery/cli install unichat-ts-mcp-server --client claude
```

### Installing manually

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

Run locally:
```json
{
  "mcpServers": {
    "unichat-ts-mcp-server": {
      "command": "node",
      "args": [
        "{{/path/to}}/unichat-ts-mcp-server/build/index.js"
      ],
      "env": {
        "UNICHAT_MODEL": "YOUR_PREFERRED_MODEL_NAME",
        "UNICHAT_API_KEY": "YOUR_VENDOR_API_KEY"
      }
    }
}
```
Run published:
```json
{
  "mcpServers": {
    "unichat-ts-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "unichat-ts-mcp-server"
      ],
      "env": {
        "UNICHAT_MODEL": "YOUR_PREFERRED_MODEL_NAME",
        "UNICHAT_API_KEY": "YOUR_VENDOR_API_KEY"
      }
    }
}
```


> Runs in STDIO by default or with argument `--stdio`. To run in SSE add argument `--sse`
```bash
npx -y unichat-ts-mcp-server --sse
```

SSE transport validates the `Host` header against `localhost`, `127.0.0.1`, and `[::1]` by default. For remote SSE deployments, set `MCP_ALLOWED_HOSTS` to a comma-separated list of allowed hostnames.

**Supported Models:**
> A list of currently supported models to be used as `"YOUR_PREFERRED_MODEL_NAME"` may be found [here](https://github.com/amidabuddha/unichat-ts/blob/main/src/models.ts). Please make sure to add the relevant vendor API key as `"YOUR_VENDOR_API_KEY"`

**Example:**
```json
"env": {
  "UNICHAT_MODEL": "gpt-5.4-mini",
  "UNICHAT_API_KEY": "YOUR_OPENAI_API_KEY"
}
```
### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

If you experience timeouts during testing in SSE mode change the request URL on the inspector interface to: http://localhost:3001/sse?timeout=600000
