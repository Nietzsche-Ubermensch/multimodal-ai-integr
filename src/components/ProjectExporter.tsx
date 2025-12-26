import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Download,
  Code,
  FileText,
  Folder,
  Package,
  Gear,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import {
  generateNextJsApiRoute,
  generateExpressApiGateway,
  generateSupabaseSchema,
  generateDockerCompose as genDockerCompose,
  generateKubernetesManifests,
  generateVercelConfig,
  generateReadme as genReadme,
} from "@/lib/template-generator";

interface ExportConfig {
  projectName: string;
  description: string;
  includeProviders: {
    anthropic: boolean;
    deepseek: boolean;
    xai: boolean;
    openrouter: boolean;
    litellm: boolean;
    nvidia: boolean;
    perplexity: boolean;
    huggingface: boolean;
  };
  includeFeatures: {
    ragPipeline: boolean;
    apiGateway: boolean;
    vectorDatabase: boolean;
    webScraping: boolean;
    embeddings: boolean;
    reranking: boolean;
    authentication: boolean;
    rateLimiting: boolean;
  };
  includeFrameworks: {
    nextjs: boolean;
    express: boolean;
    fastapi: boolean;
  };
  includeDeployment: {
    vercel: boolean;
    docker: boolean;
    kubernetes: boolean;
  };
}

const defaultConfig: ExportConfig = {
  projectName: "my-ai-app",
  description: "AI Integration Platform",
  includeProviders: {
    anthropic: true,
    deepseek: true,
    xai: true,
    openrouter: true,
    litellm: true,
    nvidia: false,
    perplexity: false,
    huggingface: true,
  },
  includeFeatures: {
    ragPipeline: true,
    apiGateway: true,
    vectorDatabase: true,
    webScraping: true,
    embeddings: true,
    reranking: false,
    authentication: true,
    rateLimiting: true,
  },
  includeFrameworks: {
    nextjs: true,
    express: false,
    fastapi: false,
  },
  includeDeployment: {
    vercel: true,
    docker: true,
    kubernetes: false,
  },
};

export function ProjectExporter() {
  const [config, setConfig] = useState<ExportConfig>(defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateProviders = (provider: keyof ExportConfig["includeProviders"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      includeProviders: { ...prev.includeProviders, [provider]: value },
    }));
  };

  const updateFeatures = (feature: keyof ExportConfig["includeFeatures"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      includeFeatures: { ...prev.includeFeatures, [feature]: value },
    }));
  };

  const updateFrameworks = (framework: keyof ExportConfig["includeFrameworks"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      includeFrameworks: { ...prev.includeFrameworks, [framework]: value },
    }));
  };

  const updateDeployment = (deployment: keyof ExportConfig["includeDeployment"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      includeDeployment: { ...prev.includeDeployment, [deployment]: value },
    }));
  };

  const generateProjectTemplate = async () => {
    setIsGenerating(true);
    try {
      const template = generateCompleteTemplate(config);
      const blob = new Blob([JSON.stringify(template, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.projectName}-template.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Project template generated!", {
        description: "Download started. Extract and follow the README.",
      });
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProviders = Object.values(config.includeProviders).filter(Boolean).length;
  const selectedFeatures = Object.values(config.includeFeatures).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Export Project Template</h2>
            <p className="text-muted-foreground">
              Generate a complete, production-ready project with all selected integrations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateProjectTemplate}
              disabled={isGenerating}
              size="lg"
              className="gap-2"
            >
              <Download size={20} />
              {isGenerating ? "Generating..." : "Export Template"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={config.projectName}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, projectName: e.target.value }))
                }
                placeholder="my-ai-app"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={config.description}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="AI Integration Platform"
              />
            </div>
          </div>
          <Card className="p-4 bg-muted/50">
            <h3 className="font-bold mb-3">Template Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI Providers</span>
                <span className="font-mono">{selectedProviders} selected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Features</span>
                <span className="font-mono">{selectedFeatures} selected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated Setup</span>
                <span className="font-mono">~15 min</span>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="providers" className="gap-2">
              <Code size={16} />
              Providers
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Gear size={16} />
              Features
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="gap-2">
              <Package size={16} />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="deployment" className="gap-2">
              <Folder size={16} />
              Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">AI Provider Integrations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(config.includeProviders).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) =>
                        updateProviders(
                          key as keyof ExportConfig["includeProviders"],
                          checked as boolean
                        )
                      }
                      id={`provider-${key}`}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`provider-${key}`}
                        className="font-medium cursor-pointer"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getProviderDescription(key)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Platform Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(config.includeFeatures).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) =>
                        updateFeatures(
                          key as keyof ExportConfig["includeFeatures"],
                          checked as boolean
                        )
                      }
                      id={`feature-${key}`}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`feature-${key}`}
                        className="font-medium cursor-pointer"
                      >
                        {formatFeatureName(key)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getFeatureDescription(key)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Framework Templates</h3>
              <div className="space-y-4">
                {Object.entries(config.includeFrameworks).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) =>
                        updateFrameworks(
                          key as keyof ExportConfig["includeFrameworks"],
                          checked as boolean
                        )
                      }
                      id={`framework-${key}`}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`framework-${key}`}
                        className="font-medium cursor-pointer"
                      >
                        {getFrameworkName(key)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getFrameworkDescription(key)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Deployment Configurations</h3>
              <div className="space-y-4">
                {Object.entries(config.includeDeployment).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) =>
                        updateDeployment(
                          key as keyof ExportConfig["includeDeployment"],
                          checked as boolean
                        )
                      }
                      id={`deployment-${key}`}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`deployment-${key}`}
                        className="font-medium cursor-pointer"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getDeploymentDescription(key)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <CheckCircle size={24} className="text-accent" weight="duotone" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">What's Included</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Complete source code with TypeScript/Python</li>
              <li>• Environment configuration templates</li>
              <li>• Docker & deployment configs</li>
              <li>• Comprehensive documentation</li>
              <li>• Security best practices guide</li>
              <li>• Production-ready file structure</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function generateCompleteTemplate(config: ExportConfig) {
  return {
    metadata: {
      name: config.projectName,
      description: config.description,
      generatedAt: new Date().toISOString(),
      version: "1.0.0",
    },
    structure: generateFileStructure(config),
    files: generateFiles(config),
    documentation: generateDocumentation(config),
    setup: generateSetupInstructions(config),
  };
}

function generateFileStructure(config: ExportConfig) {
  const structure: Record<string, string[]> = {
    root: [
      ".env.example",
      ".gitignore",
      "README.md",
      "package.json",
      "tsconfig.json",
    ],
  };

  if (config.includeFrameworks.nextjs) {
    structure["app"] = ["layout.tsx", "page.tsx"];
    structure["app/api"] = [];
    if (config.includeProviders.anthropic) structure["app/api"].push("anthropic/route.ts");
    if (config.includeProviders.openrouter) structure["app/api"].push("openrouter/route.ts");
    if (config.includeFeatures.embeddings) structure["app/api"].push("embeddings/route.ts");
  }

  if (config.includeFrameworks.express || config.includeFeatures.apiGateway) {
    structure["api-gateway"] = [
      "src/index.ts",
      "src/config.ts",
      "src/middleware/auth.ts",
      "src/middleware/ratelimit.ts",
      "src/routes/chat.ts",
      "package.json",
      "tsconfig.json",
    ];
  }

  if (config.includeDeployment.docker) {
    structure.root.push("Dockerfile", "docker-compose.yml");
  }

  if (config.includeDeployment.kubernetes) {
    structure["k8s"] = ["deployment.yaml", "service.yaml", "ingress.yaml"];
  }

  return structure;
}

function generateFiles(config: ExportConfig) {
  const files: Record<string, string> = {};

  files[".env.example"] = generateEnvTemplate(config);
  
  const features: string[] = [];
  Object.entries(config.includeFeatures)
    .filter(([_, enabled]) => enabled)
    .forEach(([feature]) => features.push(formatFeatureName(feature)));
  
  const readme = genReadme(config.projectName, features);
  files[readme.path] = readme.content;
  
  files["package.json"] = generatePackageJson(config);
  
  if (config.includeDeployment.docker) {
    const dockerCompose = genDockerCompose({
      litellm: config.includeProviders.litellm,
      redis: config.includeFeatures.rateLimiting,
      postgres: config.includeFeatures.vectorDatabase,
    });
    files[dockerCompose.path] = dockerCompose.content;
    files["Dockerfile"] = generateDockerfile(config);
  }

  if (config.includeDeployment.kubernetes) {
    const k8sManifests = generateKubernetesManifests();
    k8sManifests.forEach(manifest => {
      files[manifest.path] = manifest.content;
    });
  }

  if (config.includeDeployment.vercel) {
    const vercelConfig = generateVercelConfig();
    files[vercelConfig.path] = vercelConfig.content;
  }

  if (config.includeFeatures.vectorDatabase) {
    const schema = generateSupabaseSchema();
    files[schema.path] = schema.content;
  }

  if (config.includeFrameworks.nextjs) {
    Object.keys(config.includeProviders)
      .filter(provider => config.includeProviders[provider as keyof typeof config.includeProviders])
      .forEach(provider => {
        try {
          const route = generateNextJsApiRoute(provider);
          files[route.path] = route.content;
        } catch (e) {
        }
      });
  }

  if (config.includeFrameworks.express || config.includeFeatures.apiGateway) {
    const gatewayFiles = generateExpressApiGateway();
    gatewayFiles.forEach(file => {
      files[file.path] = file.content;
    });
  }

  return files;
}

function generateEnvTemplate(config: ExportConfig): string {
  const lines: string[] = ["# AI Provider API Keys"];
  
  if (config.includeProviders.anthropic) {
    lines.push("ANTHROPIC_API_KEY=sk-ant-...");
  }
  if (config.includeProviders.deepseek) {
    lines.push("DEEPSEEK_API_KEY=sk-...");
  }
  if (config.includeProviders.xai) {
    lines.push("XAI_API_KEY=xai-...");
  }
  if (config.includeProviders.openrouter) {
    lines.push("OPENROUTER_API_KEY=sk-or-...");
  }
  if (config.includeProviders.litellm) {
    lines.push("LITELLM_API_KEY=sk-...");
    lines.push("LITELLM_BASE_URL=http://localhost:4000");
  }
  if (config.includeProviders.nvidia) {
    lines.push("NVIDIA_NIM_API_KEY=nvapi-...");
  }
  if (config.includeProviders.huggingface) {
    lines.push("HF_TOKEN=hf_...");
  }

  if (config.includeFeatures.vectorDatabase) {
    lines.push("");
    lines.push("# Supabase Configuration");
    lines.push("NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co");
    lines.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...");
    lines.push("SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...");
  }

  if (config.includeFeatures.authentication) {
    lines.push("");
    lines.push("# Authentication");
    lines.push("JWT_SECRET=your-secret-key-change-me");
  }

  if (config.includeFeatures.rateLimiting) {
    lines.push("");
    lines.push("# Rate Limiting (Upstash Redis)");
    lines.push("UPSTASH_REDIS_REST_URL=https://xxx.upstash.io");
    lines.push("UPSTASH_REDIS_REST_TOKEN=...");
  }

  return lines.join("\n");
}

function generatePackageJson(config: ExportConfig) {
  const dependencies: Record<string, string> = {
    react: "^19.2.0",
    "react-dom": "^19.2.0",
  };

  if (config.includeProviders.anthropic) {
    dependencies["@anthropic-ai/sdk"] = "^0.71.2";
  }
  if (config.includeProviders.openrouter) {
    dependencies["@openrouter/sdk"] = "^0.3.10";
  }
  if (config.includeProviders.huggingface) {
    dependencies["@huggingface/inference"] = "^4.13.5";
  }
  if (config.includeFeatures.vectorDatabase) {
    dependencies["@supabase/supabase-js"] = "^2.89.0";
    dependencies["@supabase/ssr"] = "^0.8.0";
  }

  return JSON.stringify(
    {
      name: config.projectName,
      version: "0.1.0",
      description: config.description,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies,
    },
    null,
    2
  );
}

function generateDockerfile(config: ExportConfig): string {
  return `FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
`;
}

function generateDocumentation(config: ExportConfig) {
  return {
    setup: "Complete setup instructions in README.md",
    apiReference: "API documentation available at /docs/api",
    deployment: "Deployment guides in /docs/deployment",
  };
}

function generateSetupInstructions(config: ExportConfig) {
  return [
    "1. Extract the template archive",
    "2. Run 'npm install'",
    "3. Copy .env.example to .env and configure API keys",
    "4. Run 'npm run dev' to start development server",
    "5. Visit http://localhost:3000",
  ];
}

function getProviderDescription(key: string): string {
  const descriptions: Record<string, string> = {
    anthropic: "Claude models with prompt caching",
    deepseek: "DeepSeek Chat and Reasoner models",
    xai: "Grok models from xAI",
    openrouter: "Access 100+ models via unified API",
    litellm: "Self-hosted AI gateway with load balancing",
    nvidia: "NVIDIA NIM for accelerated inference",
    perplexity: "Perplexity AI models",
    huggingface: "HuggingFace Inference API",
  };
  return descriptions[key] || "";
}

function formatFeatureName(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    ragPipeline: "Complete RAG workflow with web scraping",
    apiGateway: "Express.js API gateway with routing",
    vectorDatabase: "Supabase with pgvector for embeddings",
    webScraping: "Firecrawl and Oxylabs integration",
    embeddings: "Text embedding generation",
    reranking: "Document reranking for improved search",
    authentication: "JWT-based authentication",
    rateLimiting: "Redis-based rate limiting",
  };
  return descriptions[key] || "";
}

function getFrameworkName(key: string): string {
  const names: Record<string, string> = {
    nextjs: "Next.js 14+ App Router",
    express: "Express.js API Server",
    fastapi: "FastAPI Python Server",
  };
  return names[key] || key;
}

function getFrameworkDescription(key: string): string {
  const descriptions: Record<string, string> = {
    nextjs: "React framework with server components and API routes",
    express: "Node.js backend with TypeScript",
    fastapi: "Python async API framework",
  };
  return descriptions[key] || "";
}

function getDeploymentDescription(key: string): string {
  const descriptions: Record<string, string> = {
    vercel: "One-click deployment with environment variables",
    docker: "Multi-stage Dockerfile and docker-compose.yml",
    kubernetes: "Production-ready K8s manifests",
  };
  return descriptions[key] || "";
}
