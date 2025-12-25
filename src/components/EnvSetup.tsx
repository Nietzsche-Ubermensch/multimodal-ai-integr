import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Key, ShieldCheck, Terminal } from "@phosphor-icons/react";
import { CodeBlock } from "@/components/CodeBlock";
import { toast } from "sonner";

interface EnvVariable {
  name: string;
  description: string;
  required: boolean;
  example: string;
  provider: string;
}

const envVariables: EnvVariable[] = [
  {
    name: "OPENROUTER_API_KEY",
    description: "OpenRouter API key for accessing 100+ models through unified gateway",
    required: true,
    example: "sk-or-v1-abc123...",
    provider: "OpenRouter"
  },
  {
    name: "DEEPSEEK_API_KEY",
    description: "DeepSeek API key for accessing DeepSeek R1, V3, and Math models",
    required: true,
    example: "sk-deepseek-xyz789...",
    provider: "DeepSeek"
  },
  {
    name: "XAI_API_KEY",
    description: "xAI API key for Grok-4 and Grok-Code-Fast models",
    required: true,
    example: "xai-abc123def456...",
    provider: "xAI"
  },
  {
    name: "NVIDIA_NIM_API_KEY",
    description: "NVIDIA NIM API key for Nemotron and other NVIDIA models",
    required: false,
    example: "nvapi-xyz789abc123...",
    provider: "NVIDIA"
  },
  {
    name: "OPENAI_API_KEY",
    description: "OpenAI API key for GPT-4 and embeddings (optional, can route through OpenRouter)",
    required: false,
    example: "sk-proj-abc123...",
    provider: "OpenAI"
  },
  {
    name: "ANTHROPIC_API_KEY",
    description: "Anthropic API key for Claude models (optional, can route through OpenRouter)",
    required: false,
    example: "sk-ant-abc123...",
    provider: "Anthropic"
  }
];

const platformConfigs = {
  vercel: {
    name: "Vercel",
    icon: "▲",
    steps: [
      "Navigate to your project settings on Vercel",
      "Go to Environment Variables section",
      "Add each required API key (name and value)",
      "Select environment: Production, Preview, Development",
      "Deploy your application to apply changes"
    ],
    cliCommand: `# Set via Vercel CLI
vercel env add OPENROUTER_API_KEY
vercel env add DEEPSEEK_API_KEY
vercel env add XAI_API_KEY`,
    configFile: null
  },
  replit: {
    name: "Replit",
    icon: "🔒",
    steps: [
      "Click on 'Tools' in the left sidebar",
      "Select 'Secrets' from the menu",
      "Add each API key as a new secret",
      "Secrets are automatically loaded as environment variables",
      "Access via process.env in your Node.js code"
    ],
    cliCommand: null,
    configFile: `# Replit automatically loads secrets
# Access in Python:
import os
api_key = os.environ["OPENROUTER_API_KEY"]

# Access in Node.js:
const apiKey = process.env.OPENROUTER_API_KEY;`
  },
  docker: {
    name: "Docker",
    icon: "🐳",
    steps: [
      "Create a .env file in your project root",
      "Add all required API keys to the .env file",
      "Add .env to .gitignore (NEVER commit to version control)",
      "Reference in docker-compose.yml using env_file",
      "Run: docker-compose up --build"
    ],
    cliCommand: `# Run with .env file
docker run --env-file .env your-image:latest

# Or pass individual variables
docker run -e OPENROUTER_API_KEY="sk-or-..." your-image:latest`,
    configFile: `# .env file
OPENROUTER_API_KEY=sk-or-v1-abc123...
DEEPSEEK_API_KEY=sk-deepseek-xyz789...
XAI_API_KEY=xai-abc123def456...
NVIDIA_NIM_API_KEY=nvapi-xyz789abc123...

# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    env_file:
      - .env
    ports:
      - "3000:3000"`
  },
  aws: {
    name: "AWS Lambda",
    icon: "☁️",
    steps: [
      "Use AWS Systems Manager Parameter Store or Secrets Manager",
      "Store each API key as a SecureString parameter",
      "Grant Lambda function IAM permissions to access secrets",
      "Load secrets in Lambda function initialization",
      "Use AWS SDK to retrieve secrets at runtime"
    ],
    cliCommand: `# Store secrets using AWS CLI
aws secretsmanager create-secret \\
  --name OPENROUTER_API_KEY \\
  --secret-string "sk-or-v1-abc123..."

# Or using Parameter Store
aws ssm put-parameter \\
  --name /myapp/OPENROUTER_API_KEY \\
  --value "sk-or-v1-abc123..." \\
  --type SecureString`,
    configFile: `# serverless.yml
provider:
  name: aws
  environment:
    OPENROUTER_API_KEY: \${ssm:/myapp/OPENROUTER_API_KEY}
    DEEPSEEK_API_KEY: \${ssm:/myapp/DEEPSEEK_API_KEY}

# Lambda function code (Node.js)
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager
    .getSecretValue({ SecretId: secretName })
    .promise();
  return data.SecretString;
}`
  },
  local: {
    name: "Local Development",
    icon: "💻",
    steps: [
      "Create a .env file in your project root",
      "Add all API keys to the .env file",
      "Install dotenv package: npm install dotenv",
      "Load at app startup: require('dotenv').config()",
      "Add .env to .gitignore immediately"
    ],
    cliCommand: `# Export in terminal (temporary)
export OPENROUTER_API_KEY="sk-or-v1-abc123..."
export DEEPSEEK_API_KEY="sk-deepseek-xyz789..."

# Or add to ~/.bashrc or ~/.zshrc for persistence
echo 'export OPENROUTER_API_KEY="sk-or-..."' >> ~/.bashrc`,
    configFile: `# .env file
OPENROUTER_API_KEY=sk-or-v1-abc123...
DEEPSEEK_API_KEY=sk-deepseek-xyz789...
XAI_API_KEY=xai-abc123def456...

# Load in Node.js (index.js)
require('dotenv').config();

# Load in Python (main.py)
from dotenv import load_dotenv
load_dotenv()

# .gitignore
.env
.env.local
.env.*.local`
  }
};

export function EnvSetup() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof platformConfigs>("vercel");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  const generateEnvTemplate = () => {
    return envVariables
      .map((env) => `${env.name}=${env.example}`)
      .join("\n");
  };

  const platform = platformConfigs[selectedPlatform];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Key size={24} className="text-accent" weight="duotone" />
            </div>
            <h3 className="text-xl font-bold">Required API Keys</h3>
          </div>
          
          <div className="space-y-3">
            {envVariables.map((env) => (
              <div
                key={env.name}
                className="p-4 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-accent font-semibold">
                      {env.name}
                    </code>
                    {env.required ? (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {env.provider}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {env.description}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background/50 px-3 py-2 rounded border border-border/30 font-mono text-muted-foreground">
                    {env.example}
                  </code>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => copyToClipboard(generateEnvTemplate(), "env-template")}
            >
              {copiedStates["env-template"] ? (
                <>
                  <Check size={16} weight="bold" />
                  Copied .env Template
                </>
              ) : (
                <>
                  <Copy size={16} weight="bold" />
                  Copy .env Template
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck size={24} className="text-primary" weight="duotone" />
            </div>
            <h3 className="text-xl font-bold">Security Best Practices</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                <span>⚠️</span> Critical Security Rules
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-destructive">•</span>
                  <span>Never commit .env files to version control</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">•</span>
                  <span>Never expose API keys in client-side code</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">•</span>
                  <span>Always use .gitignore to exclude secrets</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">•</span>
                  <span>Rotate keys immediately if exposed</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span>✓</span> Recommended Practices
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Use secrets managers (AWS Secrets Manager, Vercel Env Vars)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Implement server-side API proxy pattern</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Rotate API keys every 90 days</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Monitor API usage for anomalies</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Use separate keys for dev/staging/production</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-semibold mb-2">Validation Command</h4>
              <CodeBlock
                code={`# Test all API keys before deployment
curl -X GET https://your-api.com/api/config \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Expected response:
{
  "providers": {
    "openrouter": { "configured": true, "active": true },
    "deepseek": { "configured": true, "active": true },
    "xai": { "configured": true, "active": true }
  }
}`}
                language="bash"
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Terminal size={24} className="text-accent" weight="duotone" />
          </div>
          <h3 className="text-xl font-bold">Platform-Specific Configuration</h3>
        </div>

        <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as keyof typeof platformConfigs)}>
          <TabsList className="grid grid-cols-5 mb-6">
            {Object.entries(platformConfigs).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="gap-2">
                <span>{config.icon}</span>
                <span className="hidden sm:inline">{config.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(platformConfigs).map(([key, config]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-bold mb-3">Setup Steps for {config.name}</h4>
                <ol className="space-y-2">
                  {config.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <Badge variant="outline" className="shrink-0 h-6 w-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {config.cliCommand && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">CLI Commands</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.cliCommand!, `${key}-cli`)}
                    >
                      {copiedStates[`${key}-cli`] ? (
                        <Check size={16} weight="bold" />
                      ) : (
                        <Copy size={16} weight="bold" />
                      )}
                    </Button>
                  </div>
                  <CodeBlock
                    code={config.cliCommand}
                    language="bash"
                  />
                </div>
              )}

              {config.configFile && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Configuration Example</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.configFile!, `${key}-config`)}
                    >
                      {copiedStates[`${key}-config`] ? (
                        <Check size={16} weight="bold" />
                      ) : (
                        <Copy size={16} weight="bold" />
                      )}
                    </Button>
                  </div>
                  <CodeBlock
                    code={config.configFile}
                    language={key === 'docker' ? 'yaml' : key === 'aws' ? 'yaml' : 'bash'}
                  />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
