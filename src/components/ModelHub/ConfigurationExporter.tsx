import { useState } from "react";
import { useKV } from "@github/spark/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DownloadSimple,
  UploadSimple,
  FileJs,
  ShieldCheck,
  Warning,
  CheckCircle,
  XCircle,
  Key,
  Copy,
  FileText
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface ConfigurationData {
  version: string;
  exportDate: string;
  apiKeys: Record<string, string>;
  keyStatuses?: Record<string, any>;
  metadata?: {
    exportedBy?: string;
    platform: string;
    keysCount: number;
    validatedKeys: number;
  };
}

interface ImportResult {
  success: boolean;
  imported: number;
  validated: number;
  errors: string[];
}

export function ConfigurationExporter() {
  const [apiKeys, setApiKeys] = useKV<Record<string, string>>("modelhub_api_keys", {});
  const [keyStatuses, setKeyStatuses] = useKV<Record<string, any>>("modelhub_key_statuses", {});
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "env">("json");

  const exportConfiguration = (format: "json" | "env" = "json") => {
    if (!apiKeys || Object.keys(apiKeys).length === 0) {
      toast.error("No API keys to export");
      return;
    }

    const config: ConfigurationData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      apiKeys: apiKeys || {},
      keyStatuses: keyStatuses || {},
      metadata: {
        platform: "ModelHub AI Integration Platform",
        keysCount: Object.keys(apiKeys || {}).length,
        validatedKeys: Object.values(keyStatuses || {}).filter(s => s.status === "valid").length
      }
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(config, null, 2);
      filename = `modelhub-config-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = "application/json";
    } else {
      // ENV format
      const envLines = [
        "# ModelHub API Configuration",
        `# Exported: ${new Date().toLocaleString()}`,
        `# Keys: ${config.metadata?.keysCount}`,
        "",
        "# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "# PROVIDER API KEYS",
        "# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        ""
      ];

      Object.entries(apiKeys || {}).forEach(([provider, key]) => {
        const envVarName = `${provider.toUpperCase()}_API_KEY`;
        const status = keyStatuses?.[provider];
        const statusComment = status?.status === "valid" ? "✓ Validated" : "⚠ Not validated";
        envLines.push(`# ${provider} - ${statusComment}`);
        envLines.push(`${envVarName}="${key}"`);
        envLines.push("");
      });

      content = envLines.join("\n");
      filename = `modelhub-config-${new Date().toISOString().split('T')[0]}.env`;
      mimeType = "text/plain";
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Configuration exported as ${format.toUpperCase()}`);
  };

  const importConfiguration = async () => {
    if (!importText.trim()) {
      toast.error("Please paste configuration data");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      let importedKeys: Record<string, string> = {};
      let importedStatuses: Record<string, any> = {};

      // Try to parse as JSON first
      if (importText.trim().startsWith("{")) {
        const config: ConfigurationData = JSON.parse(importText);
        
        if (!config.apiKeys) {
          throw new Error("Invalid configuration format: missing apiKeys");
        }

        importedKeys = config.apiKeys;
        importedStatuses = config.keyStatuses || {};

        toast.info(`Importing ${Object.keys(importedKeys).length} API keys...`);
      } else {
        // Parse as ENV format
        const lines = importText.split("\n");
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          // Skip comments and empty lines
          if (!trimmed || trimmed.startsWith("#")) continue;

          // Parse KEY=value or KEY="value"
          const match = trimmed.match(/^([A-Z_]+)=["']?(.+?)["']?$/);
          if (match) {
            const [, key, value] = match;
            
            // Convert env var name to provider id
            const providerId = key
              .replace(/_API_KEY$/, "")
              .toLowerCase();
            
            importedKeys[providerId] = value;
          }
        }

        toast.info(`Importing ${Object.keys(importedKeys).length} API keys from ENV format...`);
      }

      // Validate imported keys
      const errors: string[] = [];
      let validatedCount = 0;

      for (const [provider, key] of Object.entries(importedKeys)) {
        if (!key || key.trim().length < 10) {
          errors.push(`Invalid key for ${provider}`);
          continue;
        }

        // Check if this key was already validated
        if (importedStatuses[provider]?.status === "valid") {
          validatedCount++;
        }
      }

      // Merge with existing keys (imported keys take precedence)
      const mergedKeys = { ...(apiKeys || {}), ...importedKeys };
      const mergedStatuses = { ...(keyStatuses || {}), ...importedStatuses };

      // Update storage
      setApiKeys(mergedKeys);
      setKeyStatuses(mergedStatuses);

      const result: ImportResult = {
        success: true,
        imported: Object.keys(importedKeys).length,
        validated: validatedCount,
        errors
      };

      setImportResult(result);
      toast.success(`Imported ${result.imported} API keys successfully!`);
      setImportText("");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Import failed";
      
      setImportResult({
        success: false,
        imported: 0,
        validated: 0,
        errors: [errorMessage]
      });

      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = async (format: "json" | "env") => {
    if (!apiKeys || Object.keys(apiKeys).length === 0) {
      toast.error("No API keys to copy");
      return;
    }

    const config: ConfigurationData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      apiKeys: apiKeys || {},
      keyStatuses: keyStatuses || {},
      metadata: {
        platform: "ModelHub AI Integration Platform",
        keysCount: Object.keys(apiKeys || {}).length,
        validatedKeys: Object.values(keyStatuses || {}).filter(s => s.status === "valid").length
      }
    };

    let content: string;

    if (format === "json") {
      content = JSON.stringify(config, null, 2);
    } else {
      const envLines = [
        "# ModelHub API Configuration",
        `# Exported: ${new Date().toLocaleString()}`,
        ""
      ];

      Object.entries(apiKeys || {}).forEach(([provider, key]) => {
        envLines.push(`${provider.toUpperCase()}_API_KEY="${key}"`);
      });

      content = envLines.join("\n");
    }

    await navigator.clipboard.writeText(content);
    toast.success(`Configuration copied to clipboard as ${format.toUpperCase()}`);
  };

  const clearImportField = () => {
    setImportText("");
    setImportResult(null);
  };

  const keysCount = Object.keys(apiKeys || {}).length;
  const validatedCount = Object.values(keyStatuses || {}).filter(s => s.status === "valid").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJs className="w-5 h-5" />
            Export / Import Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export" className="gap-2">
                <DownloadSimple size={16} />
                Export
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-2">
                <UploadSimple size={16} />
                Import
              </TabsTrigger>
            </TabsList>

            {/* EXPORT TAB */}
            <TabsContent value="export" className="space-y-4">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  Export your API keys and configuration to backup or transfer to another device.
                  <strong className="block mt-1">Warning:</strong> Keep exported files secure - they contain sensitive API keys.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Configured Keys</div>
                  <div className="text-2xl font-bold">{keysCount}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Validated</div>
                  <div className="text-2xl font-bold text-success">{validatedCount}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Validation Rate</div>
                  <div className="text-2xl font-bold">
                    {keysCount > 0 ? `${Math.round((validatedCount / keysCount) * 100)}%` : '0%'}
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Export Format</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card 
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      exportFormat === "json" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setExportFormat("json")}
                  >
                    <div className="flex items-center gap-3">
                      <FileJs size={24} className="text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold">JSON Format</div>
                        <div className="text-xs text-muted-foreground">
                          Includes keys, statuses, and metadata
                        </div>
                      </div>
                      {exportFormat === "json" && <CheckCircle size={20} weight="fill" className="text-primary" />}
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      exportFormat === "env" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setExportFormat("env")}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold">ENV Format</div>
                        <div className="text-xs text-muted-foreground">
                          Standard .env file format
                        </div>
                      </div>
                      {exportFormat === "env" && <CheckCircle size={20} weight="fill" className="text-primary" />}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => exportConfiguration(exportFormat)}
                  disabled={keysCount === 0}
                  className="gap-2 flex-1"
                >
                  <DownloadSimple size={18} />
                  Download {exportFormat.toUpperCase()} File
                </Button>

                <Button
                  onClick={() => copyToClipboard(exportFormat)}
                  disabled={keysCount === 0}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy size={18} />
                  Copy to Clipboard
                </Button>
              </div>

              {keysCount === 0 && (
                <Alert className="border-warning">
                  <Warning className="h-4 w-4 text-warning" />
                  <AlertDescription>
                    No API keys configured yet. Configure keys in the "API Keys" tab first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* IMPORT TAB */}
            <TabsContent value="import" className="space-y-4">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  Import API keys from a JSON export or ENV file. Supports both formats automatically.
                  <strong className="block mt-1">Note:</strong> Imported keys will be merged with existing keys.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="import-data" className="text-base font-semibold">
                    Configuration Data
                  </Label>
                  {importText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearImportField}
                      className="gap-1"
                    >
                      <XCircle size={16} />
                      Clear
                    </Button>
                  )}
                </div>
                
                <Textarea
                  id="import-data"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Paste your configuration here (JSON or ENV format)

JSON Example:
{
  "apiKeys": {
    "openrouter": "sk-or-v1-...",
    "xai": "xai-..."
  }
}

ENV Example:
OPENROUTER_API_KEY="sk-or-v1-..."
XAI_API_KEY="xai-..."`}
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>

              <Button
                onClick={importConfiguration}
                disabled={!importText.trim() || isImporting}
                className="w-full gap-2"
              >
                <UploadSimple size={18} />
                {isImporting ? "Importing..." : "Import Configuration"}
              </Button>

              {/* Import Result */}
              {importResult && (
                <Alert className={importResult.success ? "border-success" : "border-destructive"}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <AlertDescription>
                    {importResult.success ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-success">Import Successful!</div>
                        <div className="text-sm">
                          • Imported: {importResult.imported} API keys
                        </div>
                        <div className="text-sm">
                          • Pre-validated: {importResult.validated} keys
                        </div>
                        {importResult.errors.length > 0 && (
                          <div className="text-sm text-warning mt-2">
                            Warnings: {importResult.errors.join(", ")}
                          </div>
                        )}
                        <div className="text-sm mt-2 text-muted-foreground">
                          Go to the "API Keys" tab to validate imported keys.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-semibold text-destructive">Import Failed</div>
                        {importResult.errors.map((error, i) => (
                          <div key={i} className="text-sm">
                            • {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-5 h-5" />
            Security & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p><strong>Encryption:</strong> Store exported files in encrypted locations (password managers, encrypted drives)</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p><strong>Transmission:</strong> Never send configuration files via email or unsecured channels</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p><strong>Version Control:</strong> Add *.json and *.env to .gitignore to prevent accidental commits</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p><strong>Rotation:</strong> Rotate API keys every 90 days and update your exports</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p><strong>Validation:</strong> Re-validate all imported keys to ensure they're still active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
