import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

const USAGE_API = "https://crof.ai/usage_api/"
const KEY_FILE_PATH = `${process.env.HOME}/.config/opencode/crofai-key`

interface UsageResponse {
  usable_requests: number | null
  credits: number
}

export const CrofAIUsagePlugin: Plugin = async () => {
  return {
    tool: {
      "crofai-usage": tool({
        description: "Check your CrofAI account usage, remaining requests, and credits",
        args: {},
        async execute(_, context) {
          let apiKey: string | undefined

          try {
            const keyContent = await Bun.file(KEY_FILE_PATH).text()
            apiKey = keyContent.trim()
          } catch {
            return "Error: API key file not found at ~/.config/opencode/crofai-key. Please set up your API key first."
          }

          try {
            const response = await fetch(USAGE_API, {
              headers: {
                "Authorization": `Bearer ${apiKey}`,
              },
            })

            if (!response.ok) {
              return `Error: Failed to fetch usage data (HTTP ${response.status})`
            }

            const data = await response.json() as UsageResponse

            const requestsDisplay = data.usable_requests !== null
              ? `${data.usable_requests} requests remaining today`
              : "Unlimited requests (subscription plan)"

            const creditsDisplay = data.credits !== null
              ? `$${data.credits.toFixed(4)} credits available`
              : "No credits info available"

            return [
              "CrofAI Usage:",
              "",
              `  ${requestsDisplay}`,
              `  ${creditsDisplay}`,
              "",
              "For more details, visit: https://crof.ai",
            ].join("\n")
          } catch (error) {
            return `Error: Failed to connect to CrofAI API - ${error}`
          }
        },
      }),
    },
  }
}
