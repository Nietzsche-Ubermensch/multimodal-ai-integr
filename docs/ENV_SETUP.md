# Environment Variable Setup Guide

## Multimodal AI Integration Platform - Configuration Reference

This guide provides comprehensive instructions for setting up environment variables across all supported AI providers and deployment platforms.

---

## Table of Contents

1. [Required API Keys](#required-api-keys)
2. [Platform-Specific Configuration](#platform-specific-configuration)
3. [Security Best Practices](#security-best-practices)
4. [Validation & Testing](#validation--testing)
5. [Troubleshooting](#troubleshooting)

---

## Required API Keys

### Essential Keys (Required)

#### **OPENROUTER_API_KEY**
- **Provider**: OpenRouter
- **Description**: Unified API gateway for accessing 100+ AI models from multiple providers
- **Format**: `sk-or-v1-{token}`
- **Get Key**: [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **Cost**: Pay-per-token with transparent pricing
- **Models Supported**: GPT-4, Claude 3.5, Llama 3.3, Gemini 2.0, DeepSeek, Grok, and more

#### **DEEPSEEK_API_KEY**
- **Provider**: DeepSeek
- **Description**: Direct access to DeepSeek R1, V3, and Math models
- **Format**: `sk-deepseek-{token}`
- **Get Key**: [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)
- **Cost**: Competitive pricing, especially for reasoning tasks
- **Models Supported**: deepseek-chat, deepseek-r1, deepseek-math-v2

#### **XAI_API_KEY**
- **Provider**: xAI (Grok)
- **Description**: Access to Grok-4 and Grok-Code-Fast models
- **Format**: `xai-{token}`
- **Get Key**: [https://console.x.ai/](https://console.x.ai/)
- **Cost**: Premium pricing for cutting-edge reasoning
- **Models Supported**: grok-4, grok-4-fast, grok-code-fast-1

### Optional Keys (Recommended)

#### **NVIDIA_NIM_API_KEY**
- **Provider**: NVIDIA NIM
- **Description**: NVIDIA's AI microservices including Nemotron models
- **Format**: `nvapi-{token}`
- **Get Key**: [https://build.nvidia.com/](https://build.nvidia.com/)
- **Cost**: Free tier available
- **Models Supported**: nemotron-nano-9b-v2, llama-3-70b-instruct

#### **OPENAI_API_KEY**
- **Provider**: OpenAI
- **Description**: Direct access to GPT-4 and embeddings (can route through OpenRouter instead)
- **Format**: `sk-proj-{token}`
- **Get Key**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Cost**: Standard OpenAI pricing
- **Models Supported**: gpt-4, gpt-3.5-turbo, text-embedding-3-large

#### **ANTHROPIC_API_KEY**
- **Provider**: Anthropic
- **Description**: Direct access to Claude models (can route through OpenRouter instead)
- **Format**: `sk-ant-{token}`
- **Get Key**: [https://console.anthropic.com/](https://console.anthropic.com/)
- **Cost**: Standard Anthropic pricing
- **Models Supported**: claude-3-opus, claude-3-sonnet, claude-3-haiku

---

## Platform-Specific Configuration

### Vercel

**Best for**: Production web applications with serverless architecture

#### Setup via Web UI
1. Navigate to your project settings on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Settings" → "Environment Variables"
3. Add each API key:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `sk-or-v1-abc123...`
   - **Environments**: Select Production, Preview, Development as needed
4. Click "Save"
5. Redeploy your application for changes to take effect

#### Setup via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add OPENROUTER_API_KEY
# Enter value when prompted: sk-or-v1-abc123...

vercel env add DEEPSEEK_API_KEY
# Enter value when prompted: sk-deepseek-xyz789...

vercel env add XAI_API_KEY
# Enter value when prompted: xai-abc123def456...

# Deploy
vercel --prod
```

#### Access in Code
```javascript
// Next.js API Route
export default async function handler(req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  // Use apiKey for API calls
}
```

---

### Replit

**Best for**: Rapid prototyping and collaborative development

#### Setup via Secrets Manager
1. Open your Repl
2. Click on "Tools" in the left sidebar
3. Select "Secrets" from the menu
4. Click "New Secret"
5. Add each API key:
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: `sk-or-v1-abc123...`
6. Click "Add Secret"
7. Secrets are automatically available as environment variables

#### Access in Code

**Python**
```python
import os

api_key = os.environ["OPENROUTER_API_KEY"]
deepseek_key = os.environ["DEEPSEEK_API_KEY"]
```

**Node.js**
```javascript
const apiKey = process.env.OPENROUTER_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;
```

---

### Docker

**Best for**: Containerized deployments and microservices

#### Create .env File
```bash
# .env (DO NOT commit to version control)
OPENROUTER_API_KEY=sk-or-v1-abc123...
DEEPSEEK_API_KEY=sk-deepseek-xyz789...
XAI_API_KEY=xai-abc123def456...
NVIDIA_NIM_API_KEY=nvapi-xyz789abc123...
OPENAI_API_KEY=sk-proj-abc123...
ANTHROPIC_API_KEY=sk-ant-abc123...
```

#### Add to .gitignore
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

#### Docker Run with .env
```bash
# Load from .env file
docker run --env-file .env your-image:latest

# Or pass individual variables
docker run \
  -e OPENROUTER_API_KEY="sk-or-v1-..." \
  -e DEEPSEEK_API_KEY="sk-deepseek-..." \
  your-image:latest
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    env_file:
      - .env
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
```

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Environment variables passed at runtime
# Never hardcode secrets in Dockerfile

EXPOSE 3000
CMD ["npm", "start"]
```

---

### AWS Lambda

**Best for**: Serverless functions with pay-per-execution pricing

#### Using AWS Secrets Manager

**Store Secrets**
```bash
# Install AWS CLI
# Configure: aws configure

# Create secret
aws secretsmanager create-secret \
  --name multimodal-ai/openrouter \
  --secret-string "sk-or-v1-abc123..."

aws secretsmanager create-secret \
  --name multimodal-ai/deepseek \
  --secret-string "sk-deepseek-xyz789..."

aws secretsmanager create-secret \
  --name multimodal-ai/xai \
  --secret-string "xai-abc123def456..."
```

**Lambda Function Code (Node.js)**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager
    .getSecretValue({ SecretId: secretName })
    .promise();
  return data.SecretString;
}

exports.handler = async (event) => {
  const openRouterKey = await getSecret('multimodal-ai/openrouter');
  const deepseekKey = await getSecret('multimodal-ai/deepseek');
  
  // Use keys for API calls
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' })
  };
};
```

**IAM Policy** (attach to Lambda execution role)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:*:secret:multimodal-ai/*"
      ]
    }
  ]
}
```

#### Using Parameter Store

**Store Parameters**
```bash
aws ssm put-parameter \
  --name /myapp/OPENROUTER_API_KEY \
  --value "sk-or-v1-abc123..." \
  --type SecureString

aws ssm put-parameter \
  --name /myapp/DEEPSEEK_API_KEY \
  --value "sk-deepseek-xyz789..." \
  --type SecureString
```

**serverless.yml**
```yaml
service: multimodal-ai-service

provider:
  name: aws
  runtime: nodejs20.x
  environment:
    OPENROUTER_API_KEY: ${ssm:/myapp/OPENROUTER_API_KEY}
    DEEPSEEK_API_KEY: ${ssm:/myapp/DEEPSEEK_API_KEY}
    XAI_API_KEY: ${ssm:/myapp/XAI_API_KEY}

functions:
  chatCompletion:
    handler: handler.chatCompletion
    events:
      - http:
          path: /api/chat
          method: post
```

---

### Local Development

**Best for**: Development and testing on your local machine

#### Using .env File

**Create .env**
```bash
# Create .env file
cat > .env << EOF
OPENROUTER_API_KEY=sk-or-v1-abc123...
DEEPSEEK_API_KEY=sk-deepseek-xyz789...
XAI_API_KEY=xai-abc123def456...
NVIDIA_NIM_API_KEY=nvapi-xyz789abc123...
OPENAI_API_KEY=sk-proj-abc123...
ANTHROPIC_API_KEY=sk-ant-abc123...
EOF

# Add to .gitignore immediately
echo ".env" >> .gitignore
```

**Install dotenv**
```bash
# Node.js
npm install dotenv

# Python
pip install python-dotenv
```

**Load in Node.js**
```javascript
// Load at app startup (index.js or app.js)
require('dotenv').config();

// Access variables
const apiKey = process.env.OPENROUTER_API_KEY;
```

**Load in Python**
```python
# Load at app startup
from dotenv import load_dotenv
load_dotenv()

# Access variables
import os
api_key = os.environ["OPENROUTER_API_KEY"]
```

#### Using Shell Export (Temporary)

```bash
# Export in terminal (valid for current session only)
export OPENROUTER_API_KEY="sk-or-v1-abc123..."
export DEEPSEEK_API_KEY="sk-deepseek-xyz789..."
export XAI_API_KEY="xai-abc123def456..."

# Run your application
npm start
```

#### Persistent Shell Configuration

```bash
# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export OPENROUTER_API_KEY="sk-or-v1-abc123..."' >> ~/.bashrc
echo 'export DEEPSEEK_API_KEY="sk-deepseek-xyz789..."' >> ~/.bashrc
echo 'export XAI_API_KEY="xai-abc123def456..."' >> ~/.bashrc

# Reload shell
source ~/.bashrc
```

---

## Security Best Practices

### Critical Security Rules ⚠️

1. **Never commit .env files to version control**
   - Always add `.env*` to `.gitignore`
   - Check git history if accidentally committed
   - Rotate keys immediately if exposed

2. **Never expose API keys in client-side code**
   - Use server-side API proxy pattern
   - Never include keys in frontend JavaScript
   - Never log keys in console or error messages

3. **Use secrets managers in production**
   - AWS Secrets Manager for AWS deployments
   - Vercel Environment Variables for Vercel
   - Replit Secrets for Replit
   - Azure Key Vault for Azure

4. **Rotate keys regularly**
   - Every 90 days minimum
   - Immediately if suspected compromise
   - Use separate keys for dev/staging/production

5. **Implement rate limiting**
   - Prevent API abuse and cost overruns
   - Monitor usage patterns
   - Set up billing alerts

### Recommended Practices ✓

1. **Server-side API proxy pattern**
   ```javascript
   // ✅ GOOD: Server-side proxy
   // /api/chat endpoint
   export default async function handler(req, res) {
     const apiKey = process.env.OPENROUTER_API_KEY; // Server-side only
     const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
       headers: { 'Authorization': `Bearer ${apiKey}` }
     });
     return res.json(await response.json());
   }

   // ❌ BAD: Client-side exposure
   // frontend.js
   const apiKey = "sk-or-v1-abc123..."; // NEVER DO THIS
   ```

2. **Use environment-specific keys**
   ```bash
   # Development
   OPENROUTER_API_KEY=sk-or-dev-abc123...

   # Staging
   OPENROUTER_API_KEY=sk-or-staging-xyz789...

   # Production
   OPENROUTER_API_KEY=sk-or-prod-def456...
   ```

3. **Monitor API usage**
   - Set up billing alerts
   - Track usage per environment
   - Implement cost controls
   - Review logs for anomalies

4. **Validate keys before deployment**
   ```bash
   # Test configuration endpoint
   curl -X GET https://your-api.com/api/config \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

---

## Validation & Testing

### Configuration Validation Endpoint

**GET /api/config**

```javascript
// Check which providers are configured
export default async function handler(req, res) {
  const providers = {
    openrouter: {
      configured: !!process.env.OPENROUTER_API_KEY,
      active: await testProvider('openrouter')
    },
    deepseek: {
      configured: !!process.env.DEEPSEEK_API_KEY,
      active: await testProvider('deepseek')
    },
    xai: {
      configured: !!process.env.XAI_API_KEY,
      active: await testProvider('xai')
    },
    nvidia: {
      configured: !!process.env.NVIDIA_NIM_API_KEY,
      active: await testProvider('nvidia')
    }
  };

  return res.json({ providers });
}
```

### Test API Keys

**cURL Test**
```bash
# Test OpenRouter
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer sk-or-v1-abc123..."

# Test DeepSeek
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer sk-deepseek-xyz789..."

# Test xAI
curl https://api.x.ai/v1/models \
  -H "Authorization: Bearer xai-abc123def456..."
```

**Python Test Script**
```python
import os
import requests

def test_provider(provider, api_key, base_url):
    try:
        response = requests.get(
            f"{base_url}/models",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing {provider}: {e}")
        return False

# Test all providers
providers = {
    "openrouter": ("OPENROUTER_API_KEY", "https://openrouter.ai/api/v1"),
    "deepseek": ("DEEPSEEK_API_KEY", "https://api.deepseek.com/v1"),
    "xai": ("XAI_API_KEY", "https://api.x.ai/v1")
}

for name, (env_var, base_url) in providers.items():
    api_key = os.environ.get(env_var)
    if api_key:
        result = test_provider(name, api_key, base_url)
        print(f"{name}: {'✓ ACTIVE' if result else '✗ FAILED'}")
    else:
        print(f"{name}: ⚠ NOT CONFIGURED")
```

---

## Troubleshooting

### Common Issues

#### 1. "API key not found" error

**Cause**: Environment variable not loaded

**Solutions**:
- Verify `.env` file exists and is in correct directory
- Check `dotenv` is loaded: `require('dotenv').config()`
- Restart development server after adding variables
- Check variable name matches exactly (case-sensitive)

```bash
# Debug: Print all environment variables
printenv | grep API_KEY

# Or in Node.js
console.log(process.env);
```

#### 2. "Invalid API key" error

**Cause**: Incorrect key format or expired key

**Solutions**:
- Verify key format matches provider requirements
- Check for extra spaces or newlines in key
- Regenerate key from provider dashboard
- Ensure key has proper permissions/scopes

#### 3. Keys work locally but fail in production

**Cause**: Environment variables not set in production environment

**Solutions**:
- Verify variables are set in deployment platform (Vercel/AWS/etc.)
- Redeploy application after setting variables
- Check environment-specific variables (production vs. preview)
- Review deployment logs for configuration errors

#### 4. "Rate limit exceeded" error

**Cause**: Too many API requests

**Solutions**:
- Implement request caching
- Add rate limiting middleware
- Upgrade to higher tier plan
- Use multiple API keys with load balancing

#### 5. CORS errors when accessing API

**Cause**: Client-side API key usage (security issue)

**Solutions**:
- Never use API keys in frontend code
- Create server-side proxy endpoint
- Use proper CORS headers on API routes

---

## Example Complete Configuration

### .env Template
```bash
# ============================================
# MULTIMODAL AI INTEGRATION - ENVIRONMENT VARIABLES
# ============================================

# Required Providers
OPENROUTER_API_KEY=sk-or-v1-abc123...
DEEPSEEK_API_KEY=sk-deepseek-xyz789...
XAI_API_KEY=xai-abc123def456...

# Optional Providers
NVIDIA_NIM_API_KEY=nvapi-xyz789abc123...
OPENAI_API_KEY=sk-proj-abc123...
ANTHROPIC_API_KEY=sk-ant-abc123...

# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Redis Cache (optional)
REDIS_URL=redis://localhost:6379

# Monitoring (optional)
SENTRY_DSN=https://...
```

### .gitignore
```gitignore
# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# API Keys
*.key
*.pem
secrets/
```

---

## Quick Reference

| Provider | Environment Variable | Format | Get Key |
|----------|---------------------|--------|---------|
| OpenRouter | `OPENROUTER_API_KEY` | `sk-or-v1-*` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| DeepSeek | `DEEPSEEK_API_KEY` | `sk-deepseek-*` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| xAI | `XAI_API_KEY` | `xai-*` | [console.x.ai](https://console.x.ai/) |
| NVIDIA | `NVIDIA_NIM_API_KEY` | `nvapi-*` | [build.nvidia.com](https://build.nvidia.com/) |
| OpenAI | `OPENAI_API_KEY` | `sk-proj-*` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | `ANTHROPIC_API_KEY` | `sk-ant-*` | [console.anthropic.com](https://console.anthropic.com/) |

---

## Support

For additional help:
- Review provider documentation
- Check platform-specific guides (Vercel, AWS, etc.)
- Test with validation scripts
- Monitor logs for detailed error messages

**Remember**: Security is paramount. Treat API keys like passwords - never share, commit, or expose them publicly.
