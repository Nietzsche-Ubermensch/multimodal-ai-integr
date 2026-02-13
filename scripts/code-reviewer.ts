import OpenAI from 'openai';
import { spawnSync } from 'child_process';
import * as fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tools Definition
const tools = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Reads the content of a file.',
      parameters: {
        type: 'object',
        properties: {
          filepath: { type: 'string', description: 'The path to the file to read.' },
        },
        required: ['filepath'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'grep',
      description: 'Searches for a pattern in files using grep.',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'The regex pattern or string to search for.' },
          path: { type: 'string', description: 'The path or directory to search in (defaults to .).' },
        },
        required: ['pattern'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'glob',
      description: 'Finds files matching a pattern.',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'The file pattern to match (e.g., "*.ts").' },
          path: { type: 'string', description: 'The directory to search in.' },
        },
        required: ['pattern'],
      },
    },
  },
];

async function runTool(name: string, args: any): Promise<string> {
  try {
    switch (name) {
      case 'read_file': {
        if (!fs.existsSync(args.filepath)) {
            return `Error: File not found: ${args.filepath}`;
        }
        const content = fs.readFileSync(args.filepath, 'utf-8');
        return content;
      }
      case 'grep': {
        const searchPath = args.path || '.';
        // Using spawnSync avoids shell injection.
        // Note: 'grep' might not be available on all systems (e.g. strict Windows), but common in CI/Unix.
        const result = spawnSync('grep', ['-r', args.pattern, searchPath], { encoding: 'utf-8', maxBuffer: 1024 * 1024 });

        if (result.error) {
            return `Error running grep: ${result.error.message}`;
        }

        // Grep returns 0 on match, 1 on no match, 2 on error
        if (result.status === 1) return 'No matches found.';
        if (result.status !== 0) return `Grep failed: ${result.stderr}`;

        // Limit output
        const lines = result.stdout.split('\n');
        if (lines.length > 20) {
            return lines.slice(0, 20).join('\n') + `\n... (${lines.length - 20} more lines)`;
        }
        return result.stdout;
      }
      case 'glob': {
        const searchPath = args.path || '.';
        // Using find command safely
        const result = spawnSync('find', [searchPath, '-name', args.pattern], { encoding: 'utf-8' });

        if (result.error) {
             return `Error running find: ${result.error.message}`;
        }

        const lines = result.stdout.split('\n');
        if (lines.length > 20) {
            return lines.slice(0, 20).join('\n') + `\n... (${lines.length - 20} more lines)`;
        }
        return result.stdout;
      }
      default:
        return 'Unknown tool';
    }
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}

async function review(prompt: string) {
  const messages: any[] = [
    {
      role: 'system',
      content: `You are a code reviewer agent. You have access to the codebase using tools.
Your goal is to review code for quality, security, and correctness.
Always verify your assumptions by reading the code.
If you are asked to review specific changes, try to locate the modified files first.
Provide a concise summary of your findings.`,
    },
    { role: 'user', content: prompt },
  ];

  console.log(`Starting review for: ${prompt}`);

  let turns = 0;
  const maxTurns = 15;

  while (turns < maxTurns) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: tools as any,
      tool_choice: 'auto',
    });

    const message = response.choices[0].message;
    messages.push(message);

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        console.log(`> Running tool: ${toolCall.function.name}`);
        const args = JSON.parse(toolCall.function.arguments);
        const result = await runTool(toolCall.function.name, args);

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    } else {
      console.log('\n=== Review Report ===\n');
      console.log(message.content);
      break;
    }
    turns++;
  }
}

const prompt = process.argv[2] || 'Review the codebase.';
review(prompt).catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
