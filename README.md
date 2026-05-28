# CrofAI Plugin for OpenCode

A plugin suite for [OpenCode](https://opencode.ai) that integrates [CrofAI](https://crof.ai) models and usage tracking.

## Features

- **Auto-sync models**: Automatically fetches and syncs models from CrofAI's `/v1/models` API
- **Reasoning support**: Supports reasoning models with interleaved thinking (DeepSeek, Kimi, GLM, etc.)
- **Clean model names**: No redundant provider prefix in the TUI
- **Usage tracking**: Check your remaining requests and credits directly from OpenCode
- **API key authentication**: Secure file-based API key reference
- **Variant support**: Works with OpenCode's variant system for reasoning effort control

## Installation

### 1. Copy the plugin files

```bash
mkdir -p ~/.config/opencode/plugins
cp plugins/crofai-models.ts ~/.config/opencode/plugins/
cp plugins/crofai-usage.ts ~/.config/opencode/plugins/
```

### 2. Set up your API key

Create the API key file:

```bash
mkdir -p ~/.config/opencode
echo "your-api-key-here" > ~/.config/opencode/crofai-key
chmod 600 ~/.config/opencode/crofai-key
```

### 3. Configure OpenCode

Add the plugin to your `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "CrofAI": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "CrofAI",
      "options": {
        "baseURL": "https://crof.ai/v1",
        "apiKey": "{file:~/.config/opencode/crofai-key}"
      }
    }
  },
  "plugin": ["crofai-models", "crofai-usage"]
}
```

### 4. Restart OpenCode

The plugins will automatically load all available models from the CrofAI API and provide the usage tracking tool.

## Configuration

### Minimal Setup

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "CrofAI": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "CrofAI",
      "options": {
        "baseURL": "https://crof.ai/v1",
        "apiKey": "{file:~/.config/opencode/crofai-key}"
      }
    }
  },
  "plugin": ["crofai-models", "crofai-usage"]
}
```

### Full Setup with Cost-Effective Subagents

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "CrofAI": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "CrofAI",
      "options": {
        "baseURL": "https://crof.ai/v1",
        "apiKey": "{file:~/.config/opencode/crofai-key}"
      }
    }
  },
  "agent": {
    "explore": {
      "description": "Fast read-only codebase discovery",
      "mode": "subagent",
      "model": "CrofAI/qwen3.5-9b"
    },
    "execution": {
      "description": "Low-cost implementation subagent",
      "mode": "subagent",
      "model": "CrofAI/glm-4.7-flash"
    },
    "ui": {
      "description": "Frontend and interface specialist",
      "mode": "subagent",
      "model": "CrofAI/greg-1-mini"
    }
  },
  "plugin": ["crofai-models", "crofai-usage"]
}
```

## Available Models

Models are automatically synced from the CrofAI API. Here's the current list:

### Reasoning Models

| Model | Context | Output | Prompt ($/M) | Completion ($/M) |
|-------|---------|--------|--------------|------------------|
| deepseek-v4-pro | 1M | 131K | $0.30 | $0.50 |
| deepseek-v4-flash | 1M | 131K | $0.12 | $0.21 |
| kimi-k2.6 | 262K | 262K | $0.50 | $1.99 |
| kimi-k2.5 | 262K | 262K | $0.35 | $1.70 |
| glm-5.1 | 202K | 202K | $0.45 | $2.10 |
| qwen3.5-397b-a17b | 262K | 262K | $0.35 | $1.75 |
| qwen3.6-27b | 262K | 262K | $0.20 | $1.50 |
| qwen3.5-9b | 262K | 262K | $0.04 | $0.15 |
| gemma-4-31b-it | 262K | 262K | $0.10 | $0.30 |

### Non-Reasoning Models

| Model | Context | Output | Prompt ($/M) | Completion ($/M) |
|-------|---------|--------|--------------|------------------|
| deepseek-v3.2 | 163K | 163K | $0.28 | $0.38 |
| glm-4.7 | 202K | 202K | $0.25 | $1.10 |
| glm-4.7-flash | 202K | 131K | $0.04 | $0.30 |
| greg-1-mini | 229K | 229K | $0.07 | $0.15 |
| greg-1 | 229K | 229K | $0.10 | $0.30 |
| minimax-m2.5 | 204K | 131K | $0.11 | $0.95 |

### Cost-Effective Recommendations

For subagents, we recommend:

| Agent | Model | Why |
|-------|-------|-----|
| explore | `qwen3.5-9b` | Cheapest with reasoning ($0.04/M prompt) |
| execution | `glm-4.7-flash` | Cheapest overall ($0.04/M prompt) |
| ui | `greg-1-mini` | Good balance ($0.07/M prompt) |

## Usage Tracking

### Using the Tool

Ask OpenCode to check your usage:

```
Check my CrofAI usage
```

Or use the tool directly:

```
@crofai-usage
```

The tool will return:

```
CrofAI Usage:

  450 requests remaining today
  $12.3456 credits available

For more details, visit: https://crof.ai
```

### API Reference

Check your remaining usage and credits:

```bash
curl https://crof.ai/usage_api/ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "usable_requests": 450,
  "credits": 12.3456
}
```

- `usable_requests`: Requests left today (null if not on a subscription plan)
- `credits`: Available credit balance

## Troubleshooting

### Models not loading

1. Check your API key file exists:
   ```bash
   cat ~/.config/opencode/crofai-key
   ```

2. Verify the plugins are loaded:
   ```bash
   opencode debug info
   ```

3. Check models are listed:
   ```bash
   opencode models CrofAI
   ```

### TUI not responding

If the TUI shows the model but no response, ensure your `opencode.json` has the correct structure. The minimal working config is:

```json
{
  "provider": {
    "CrofAI": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "CrofAI",
      "options": {
        "baseURL": "https://crof.ai/v1",
        "apiKey": "{file:~/.config/opencode/crofai-key}"
      }
    }
  },
  "plugin": ["crofai-models", "crofai-usage"]
}
```

### Reasoning content not showing

The plugin automatically configures `reasoning: true` and `interleaved: { field: "reasoning_content" }` for models that support it. If you don't see thinking content, verify the model supports reasoning in the model list above.

## License

MIT License - see [LICENSE](LICENSE) for details.
