import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || 'mock-key',
  baseURL: process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : undefined,
});

// Tool Definitions
const tools = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file. Use this to inspect code.',
      parameters: {
        type: 'object',
        properties: {
          filepath: {
            type: 'string',
            description: 'The path to the file to read (relative to repo root)',
          },
        },
        required: ['filepath'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'grep_files',
      description: 'Search for a pattern in files using grep.',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'The regex pattern to search for',
          },
          path: {
            type: 'string',
            description: 'The directory or file path to search in',
          },
        },
        required: ['pattern'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'glob_files',
      description: 'List files matching a glob pattern.',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'The glob pattern (e.g., "**/*.ts")',
          },
        },
        required: ['pattern'],
      },
    },
  },
];

// Tool Implementations
const read_file = (filepath: string) => {
  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch (e: any) {
    return `Error reading file: ${e.message}`;
  }
};

const grep_files = (pattern: string, searchPath: string = '.') => {
  try {
    // Use spawnSync to avoid shell command injection
    const args = ['-r', pattern, searchPath];
    const result = spawnSync('grep', args, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

    if (result.error) {
        return `Error running grep: ${result.error.message}`;
    }
    // grep returns 1 if no matches found, which is not an error for us
    if (result.status !== 0 && result.status !== 1) {
        return `Grep failed with status ${result.status}: ${result.stderr}`;
    }
    return result.stdout || 'No matches found.';
  } catch (e: any) {
    return `Error running grep: ${e.message}`;
  }
};

const glob_files = (pattern: string) => {
  try {
    // Use git ls-files as it handles globs safely within the repo
    const result = spawnSync('git', ['ls-files', pattern], { encoding: 'utf-8' });

    if (result.error) {
         // Fallback to find if git fails (e.g. not a git repo?)
         // However, 'find' with -name is safer than shell glob injection if args are separated
         const findResult = spawnSync('find', ['.', '-name', pattern], { encoding: 'utf-8' });
         if (findResult.error) return `Error listing files: ${findResult.error.message}`;
         return findResult.stdout;
    }
    return result.stdout;
  } catch (e: any) {
    return `Error listing files: ${e.message}`;
  }
};

async function main() {
  console.log('Starting Code Review Agent...');

  // Get changed files (Diff)
  let diff = '';
  try {
    // In GitHub Actions, we might need to fetch target branch first.
    // Assuming 'origin/main' is the target.
    diff = execSync('git diff --name-only origin/main...HEAD || git diff --name-only HEAD~1', { encoding: 'utf-8' });
  } catch (e) {
    console.log('Could not determine changed files via git diff. Reviewing all files provided in arguments or defaulting to src/');
    diff = 'src/';
  }

  const changedFiles = diff.split('\n').filter(f => f.trim() && !f.includes('package-lock.json'));

  if (changedFiles.length === 0) {
    console.log('No files changed.');
    return;
  }

  console.log(`Reviewing ${changedFiles.length} files:`, changedFiles);

  const systemPrompt = `You are a Code Reviewer Subagent.
Your goal is to review the code changes for quality, security, and performance.
You have access to read-only tools: read_file, grep_files, glob_files.
You CANNOT modify the code.
Provide a concise summary of issues found, if any.
Focus on:
1. Security vulnerabilities (input validation, secrets, etc.)
2. Performance bottlenecks (unnecessary loops, allocations)
3. Code quality (types, naming, patterns)

The user will provide the list of changed files. You should read them to understand the context.
`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Please review the following changed files:\n${changedFiles.join('\n')}` }
  ];

  try {
    let finished = false;
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    while (!finished && iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages,
        tools: tools as any,
        tool_choice: 'auto',
      });

      const message = response.choices[0].message;
      messages.push(message);

      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let result = '';

          console.log(`Calling tool: ${fnName}`, args);

          if (fnName === 'read_file') result = read_file(args.filepath);
          else if (fnName === 'grep_files') result = grep_files(args.pattern, args.path);
          else if (fnName === 'glob_files') result = glob_files(args.pattern);
          else result = 'Unknown tool';

          // Truncate result if too long to avoid token limits
          if (result.length > 5000) result = result.substring(0, 5000) + '...[truncated]';

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result,
          });
        }
      } else {
        finished = true;
        console.log('\n=== CODE REVIEW ===\n');
        console.log(message.content);
        // Write report to a file for GitHub Actions to pick up
        fs.writeFileSync('review-report.md', message.content || 'No comments.');
      }
    }
  } catch (error: any) {
    console.error('Error during review:', error);
    process.exit(1);
  }
}

main();
