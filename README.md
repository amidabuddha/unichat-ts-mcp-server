# unichat-ts-mcp-server MCP Server

Unichat MCP Server

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

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

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

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
