import type { Model, Provider } from "@earendil-works/pi-ai"
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import type { TokenFluxApi } from "./model.js"
import { createProvider, envApiKeyAuth, openAICompletionsApi, openAIResponsesApi } from "@earendil-works/pi-ai/compat"
import { readConfig } from "./config.js"
import { TOKENFLUX_API_KEY_ENV, TOKENFLUX_BASE_URL } from "./const.js"
import { fetchModels } from "./model.js"

export function buildProvider(name: string, baseUrl: string = TOKENFLUX_BASE_URL): Provider<TokenFluxApi> {
  const normalized = baseUrl.replace(/\/+$/, "")
  return createProvider<TokenFluxApi>({
    id: name,
    name: `TokenFlux: ${name}`,
    baseUrl: `${normalized}/v1`,
    auth: {
      apiKey: envApiKeyAuth("TokenFlux API key", [TOKENFLUX_API_KEY_ENV]),
    },
    models: [],
    api: {
      "openai-completions": openAICompletionsApi(),
      "openai-responses": openAIResponsesApi(),
    },
    fetchModels: async (context): Promise<readonly Model<TokenFluxApi>[]> => {
      const credential = context.credential
      if (!credential || credential.type !== "api_key" || !credential.key) {
        return []
      }
      return fetchModels({
        provider: name,
        baseUrl: normalized,
        apiKey: credential.key,
        signal: context.signal,
      })
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
