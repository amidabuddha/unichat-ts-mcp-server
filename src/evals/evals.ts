//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const unichatEval: EvalFunction = {
    name: "unichatEval",
    description: "Evaluates the unichat tool functionality",
    run: async () => {
        const result = await grade(openai("gpt-4"), "Ask the unichat to review and evaluate your proposal focusing on cost savings and return on investment.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [unichatEval]
};
  
export default config;
  
export const evals = [unichatEval];