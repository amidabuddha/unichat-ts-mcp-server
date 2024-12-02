#!/usr/bin/env node

import { UnifiedChatApi, Message, MODELS_LIST, Role } from "unichat-ts";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";


// Environment validation
const MODEL = process.env.UNICHAT_MODEL;
if (!MODEL) {
  throw new Error("UNICHAT_MODEL environment variable required");
}
if (!Object.values(MODELS_LIST).flat().includes(MODEL)) {
  throw new Error(`Unsupported model: ${MODEL}`);
}

const API_KEY = process.env.UNICHAT_API_KEY;
if (!API_KEY) {
  throw new Error("UNICHAT_API_KEY environment variable required");
}


// Validation functions
function validateMessages(messages: Message[]): void {
  if (messages.length !== 2) {
    throw new Error("Exactly two messages are required: one system message and one user message");
  }

  if (messages[0].role !== "system") {
    throw new Error("First message must have role 'system'");
  }

  if (messages[1].role !== "user") {
    throw new Error("Second message must have role 'user'");
  }
}

// Format response helper
function formatResponse(response: string) {
  try {
    return { type: "text", text: response.trim() };
  } catch (e) {
    return { type: "text", text: `Error formatting response: ${String(e)}` };
  }
}

// Define prompts
const PROMPTS = [
  {
    name: "code_review",
    description: "Review code for best practices, potential issues, and improvements",
    arguments: [{
      name: "code",
      description: "The code to review",
      required: true
    }]
  },
  {
    name: "document_code",
    description: "Generate documentation for code including docstrings and comments",
    arguments: [{
      name: "code",
      description: "The code to document",
      required: true
    }]
  },
  {
    name: "explain_code",
    description: "Explain how a piece of code works in detail",
    arguments: [{
      name: "code",
      description: "The code to explain",
      required: true
    }]
  },
  {
    name: "code_rework",
    description: "Apply requested changes to the provided code",
    arguments: [
      {
        name: "changes",
        description: "The changes to apply",
        required: false
      },
      {
        name: "code",
        description: "The code to rework",
        required: true
      }
    ]
  }
];

const PROMPT_TEMPLATES = {
  "code_review": `You are a senior software engineer conducting a thorough code review.
    Review the following code for:
    - Best practices
    - Potential bugs
    - Performance issues
    - Security concerns
    - Code style and readability

    Code to review:
    {code}`,
  "document_code": `You are a technical documentation expert.
    Generate comprehensive documentation for the following code.
    Include:
    - Overview
    - Function/class documentation
    - Parameter descriptions
    - Return value descriptions
    - Usage examples

    Code to document:
    {code}`,
  "explain_code": `You are a programming instructor explaining code to a beginner level programmer.
    Explain how the following code works:

    {code}

    Break down:
    - Overall purpose
    - Key components
    - How it works step by step
    - Any important concepts used`,
  "code_rework": `You are a software architect specializing in code optimization and modernization.
    With a foucs on:
    - Modernizing syntax and approaches
    - Improving structure and organization
    - Enhancing maintainability
    - Optimizing performance
    - Applying current best practices
    Do: {changes}

    Code to transform:
    {code}`
};

// Create server instance
const server = new Server(
  {
    name: "unichat-ts-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "unichat",
        description: `Chat with the assistant. Messages must follow a specific structure:
            - First message should be a system message defining the task or context
            - Second message should be a user message containing the specific query or request

            Example structure:
            {
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant focused on answering questions about Python programming"},
                    {"role": "user", "content": "How do I use list comprehensions?"}
                ]
            }`,
        inputSchema: {
          type: "object",
          properties: {
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    description: "The role of the message sender. Must be either 'system' or 'user'",
                    enum: ["system", "user"]
                  },
                  content: {
                    type: "string",
                    description: "The content of the message. For system messages, this should define the context or task. For user messages, this should contain the specific query."
                  },
                },
                required: ["role", "content"],
              },
              minItems: 2,
              maxItems: 2,
              description: "Array of exactly two messages: first a system message defining the task, then a user message with the specific query"
            },
          },
          required: ["messages"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "unichat": {
      try {
        const messages = request.params.arguments?.messages as Message[];
        validateMessages(messages);

        const client = new UnifiedChatApi(API_KEY);

        const response = await client.chat.completions.create({
          model: MODEL,
          messages: messages,
          stream: false
        });

        return {
          content: [formatResponse(response.toString())]
        };
      } catch (e) {
        throw new Error(`An error occurred: ${String(e)}`);
      }
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// Prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      ...Object.values(PROMPTS)
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const promptNames: string[] = PROMPTS.map(prompt => prompt.name);

  if (promptNames.includes(name)) {

    if (!args) {
      throw new Error("Missing arguments");
    }

    if (!args.code) {
      throw new Error("Missing required argument: code");
    }

    const template = PROMPT_TEMPLATES[name as keyof typeof PROMPT_TEMPLATES];
    const systemContent = template
      .replace("{code}", args.code)
      .replace("{changes}", args.changes || "");

    try {
      const client = new UnifiedChatApi(API_KEY);

      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          {"role": Role.System, "content": systemContent},
          {"role": Role.User, "content": "Please provide your analysis."}
      ],
        stream: false
      });

      return {
        content: [formatResponse(response.toString())]
      };
    } catch (e) {
      throw new Error(`An error occurred: ${String(e)}`);
    }
  }

  throw new Error("Unknown prompt");
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});