#!/usr/bin/env node

import { program } from 'commander';

async function main() {
  program
    .option('-s, --stdio', 'Use stdio transport')
    .option('-e, --sse', 'Use SSE transport')
    .parse(process.argv);

  const options = program.opts();

  // Default to stdio if no transport is specified
  if (!options.sse && !options.stdio) {
    options.stdio = true;
  }

  if (options.stdio) {
    await import('./transports/stdio.js');
  } else if (options.sse) {
    await import('./transports/sse.js');
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});