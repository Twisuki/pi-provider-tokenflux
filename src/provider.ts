import type { Model, Provider } from "@earendil-works/pi-ai"
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { createProvider, envApiKeyAuth, openAICompletionsApi } from "@earendil-works/pi-ai/compat"
import { readConfig } from "./config.js"
import { REFRESH_TIMEOUT_MS, TOKENFLUX_API_KEY_ENV, TOKENFLUX_BASE_URL } from "./const.js"

export function buildProvider(name: string, baseUrl: string = TOKENFLUX_BASE_URL): Provider<"openai-completions"> {
  const normalized = baseUrl.replace(/\/+$/, "")
  return createProvider<"openai-completions">({
    id: name,
    name: `TokenFlux: ${name}`,
    baseUrl: `${normalized}/v1`,
    auth: {
      apiKey: envApiKeyAuth("TokenFlux API key", [TOKENFLUX_API_KEY_ENV]),
    },
    models: [],
    api: openAICompletionsApi(),
    fetchModels: async (context): Promise<readonly Model<"openai-completions">[]> => {
      const credential = context.credential
      if (!credential || credential.type !== "api_key" || !credential.key) {
        return []
      }
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS)
      const signal = AbortSignal.any([context.signal, controller.signal])
      try {
        const res = await fetch(`${normalized}/v1/models`, {
          headers: { Authorization: `Bearer ${credential.key}` },
          signal,
        })
        if (!res.ok) {
          return []
        }
        const data = await res.json() as { data?: Array<{ id: string }> }
        if (!data.data) {
          return []
        }
        return data.data.map(m => ({
          id: m.id,
          name: m.id,
          api: "openai-completions",
          provider: name,
          baseUrl: `${normalized}/v1`,
          input: ["text"],
          reasoning: false,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          contextWindow: 128000,
          maxTokens: 16384,
        }))
      }
      catch {
        return []
      }
      finally {
        clearTimeout(timer)
      }
    },
  })
}

export function restoreProviders(pi: ExtensionAPI): void {
  const config = readConfig()
  if (!config || config.providers.length === 0) {
    return
  }
  for (const name of config.providers) {
    try {
      pi.registerProvider(buildProvider(name))
    }
    catch {}
  }
}
