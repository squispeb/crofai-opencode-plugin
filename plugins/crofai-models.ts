import type { Plugin } from "@opencode-ai/plugin"

interface CrofAIModel {
  id: string
  name: string
  context_length: number
  max_completion_tokens: number
  custom_reasoning: boolean
  reasoning_effort?: boolean
  pricing: {
    prompt: string
    completion: string
    cache_prompt?: string
  }
  quantization: string
  speed: number
}

interface CrofAIModelsResponse {
  data: CrofAIModel[]
}

const MODELS_API = "https://crof.ai/v1/models"
const KEY_FILE_PATH = `${process.env.HOME}/.config/opencode/crofai-key`
const KEY_FILE_REF = "~/.config/opencode/crofai-key"

export const CrofAIModelsPlugin: Plugin = async ({ $ }) => {
  let apiKey: string | undefined

  try {
    const keyContent = await Bun.file(KEY_FILE_PATH).text()
    apiKey = keyContent.trim()
  } catch {
    console.warn("[crofai-models] API key file not found, using unauthenticated requests")
  }

  return {
    config: async (config) => {
      try {
        const headers: Record<string, string> = {}
        if (apiKey) {
          headers["Authorization"] = `Bearer ${apiKey}`
        }

        const response = await fetch(MODELS_API, { headers })
        if (!response.ok) {
          console.error(`[crofai-models] Failed to fetch models: ${response.status}`)
          return
        }

        const { data: models } = await response.json() as CrofAIModelsResponse

        if (!config.provider) {
          config.provider = {}
        }

        if (!config.provider.CrofAI) {
          config.provider.CrofAI = {
            npm: "@ai-sdk/openai-compatible",
            name: "CrofAI",
            options: {
              baseURL: "https://crof.ai/v1",
              apiKey: `{file:${KEY_FILE_REF}}`,
            },
            models: {},
          }
        }

        if (!config.provider.CrofAI.models) {
          config.provider.CrofAI.models = {}
        }

        for (const model of models) {
          const hasReasoning = model.reasoning_effort === true

          const baseVariants = {
            default: {},
          }

          const reasoningVariants = hasReasoning
            ? {
                ...baseVariants,
                none: { reasoningEffort: "none" },
                low: { reasoningEffort: "low" },
                medium: { reasoningEffort: "medium" },
                high: { reasoningEffort: "high" },
              }
            : baseVariants

          const cleanName = model.name.includes(": ")
            ? model.name.split(": ").slice(1).join(": ")
            : model.name

          config.provider.CrofAI.models[model.id] = {
            name: cleanName,
            limit: {
              context: model.context_length,
              output: model.max_completion_tokens,
            },
            ...(hasReasoning && {
              reasoning: true,
              interleaved: { field: "reasoning_content" },
            }),
            variants: reasoningVariants,
          }
        }

        console.log(`[crofai-models] Loaded ${models.length} models from API`)
      } catch (error) {
        console.error("[crofai-models] Error fetching models:", error)
      }
    },
  }
}
