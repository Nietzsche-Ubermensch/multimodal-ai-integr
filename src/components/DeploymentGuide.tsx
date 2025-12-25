import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/CodeBlock";
import { GitBranch, RocketLaunch, Terminal, Cloud } from "@phosphor-icons/react";

export function DeploymentGuide() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="vercel" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger value="vercel" className="gap-2">
            <Cloud size={16} weight="fill" />
            Vercel
          </TabsTrigger>
          <TabsTrigger value="replit" className="gap-2">
            <Terminal size={16} weight="fill" />
            Replit
          </TabsTrigger>
          <TabsTrigger value="docker" className="gap-2">
            <RocketLaunch size={16} weight="fill" />
            Docker
          </TabsTrigger>
          <TabsTrigger value="aws" className="gap-2">
            <GitBranch size={16} weight="fill" />
            AWS Lambda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vercel" className="space-y-4">
          <Card className="p-6 bg-card/50 border-l-4 border-accent">
            <div className="flex items-center gap-3 mb-4">
              <Cloud size={24} weight="fill" className="text-accent" />
              <h3 className="text-xl font-bold">Deploy to Vercel (Recommended)</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">Step 1: Install Vercel CLI</Badge>
                <CodeBlock
                  code={`npm install -g vercel`}
                  language="bash"
                  title="Install Vercel CLI"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 2: Configure Environment Variables</Badge>
                <CodeBlock
                  code={`# .env.local
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_API_KEY=sk-...
XAI_API_KEY=xai-...
NVIDIA_NIM_API_KEY=nvapi-...`}
                  language="bash"
                  title="Environment Variables"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 3: Create vercel.json</Badge>
                <CodeBlock
                  code={`{
  "env": {
    "OPENROUTER_API_KEY": "@openrouter-key",
    "DEEPSEEK_API_KEY": "@deepseek-key"
  },
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}`}
                  language="json"
                  title="vercel.json"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 4: Deploy</Badge>
                <CodeBlock
                  code={`vercel --prod`}
                  language="bash"
                  title="Deploy to Production"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="replit" className="space-y-4">
          <Card className="p-6 bg-card/50 border-l-4 border-accent">
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={24} weight="fill" className="text-accent" />
              <h3 className="text-xl font-bold">Deploy to Replit</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">Step 1: Fork Repository</Badge>
                <p className="text-sm text-muted-foreground mb-2">
                  Click "Fork Repl" from the template or import from GitHub
                </p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 2: Configure Secrets</Badge>
                <CodeBlock
                  code={`# In Replit Secrets panel (Tools → Secrets):
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_API_KEY=sk-...
XAI_API_KEY=xai-...
NVIDIA_NIM_API_KEY=nvapi-...`}
                  language="bash"
                  title="Configure Secrets"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 3: Install Dependencies</Badge>
                <CodeBlock
                  code={`pip install litellm python-dotenv
# or for Node.js projects:
npm install @litellm/node`}
                  language="bash"
                  title="Install Dependencies"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 4: Run</Badge>
                <CodeBlock
                  code={`# Python
python main.py

# Node.js
npm run dev`}
                  language="bash"
                  title="Run Application"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="docker" className="space-y-4">
          <Card className="p-6 bg-card/50 border-l-4 border-accent">
            <div className="flex items-center gap-3 mb-4">
              <RocketLaunch size={24} weight="fill" className="text-accent" />
              <h3 className="text-xl font-bold">Deploy with Docker</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">Step 1: Create Dockerfile</Badge>
                <CodeBlock
                  code={`FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]`}
                  language="docker"
                  title="Dockerfile"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 2: Create docker-compose.yml</Badge>
                <CodeBlock
                  code={`version: '3.8'

services:
  ai-gateway:
    build: .
    ports:
      - "8080:8080"
    environment:
      - OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}
      - DEEPSEEK_API_KEY=\${DEEPSEEK_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`}
                  language="yaml"
                  title="docker-compose.yml"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 3: Build & Run</Badge>
                <CodeBlock
                  code={`docker-compose up --build -d`}
                  language="bash"
                  title="Build & Run Containers"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="aws" className="space-y-4">
          <Card className="p-6 bg-card/50 border-l-4 border-accent">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch size={24} weight="fill" className="text-accent" />
              <h3 className="text-xl font-bold">Deploy to AWS Lambda</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">Step 1: Install Serverless Framework</Badge>
                <CodeBlock
                  code={`npm install -g serverless
serverless plugin install -n serverless-python-requirements`}
                  language="bash"
                  title="Install Serverless Framework"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 2: Create serverless.yml</Badge>
                <CodeBlock
                  code={`service: ai-gateway

provider:
  name: aws
  runtime: python3.11
  region: us-east-1
  environment:
    OPENROUTER_API_KEY: \${ssm:/ai-gateway/openrouter-key}
    DEEPSEEK_API_KEY: \${ssm:/ai-gateway/deepseek-key}

functions:
  chat:
    handler: handler.chat
    events:
      - http:
          path: /api/chat
          method: post
          cors: true
    timeout: 30
    memorySize: 1024

plugins:
  - serverless-python-requirements`}
                  language="yaml"
                  title="serverless.yml"
                />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Step 3: Deploy</Badge>
                <CodeBlock
                  code={`serverless deploy --stage prod`}
                  language="bash"
                  title="Deploy to AWS"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
