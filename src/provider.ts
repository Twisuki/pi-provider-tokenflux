import type { Provider } from "@earendil-works/pi-ai"
import { createProvider, envApiKeyAuth } from "@earendil-works/pi-ai"
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy"
import { TOKENFLUX_API_KEY_ENV, TOKENFLUX_BASE_URL } from "./const.js"

export type ProviderMode = "simple" | "composite"

export interface RefreshContext {
  signal: AbortSignal
  publish: (update: { update: Provider }) => void
}

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
  })
}

// TODO: implement 15s-timeout fetch of /v1/models, map to pi Model shape, publish via context.publish, persist to catalog-store, swallow errors silently
export async function refreshModels(
  _context: RefreshContext,
  _baseUrl: string,
  _apiKey: string,
): Promise<void> {
  throw new Error("refreshModels: not implemented yet")
}

// TODO: return "composite" if any id contains "/", else "simple"
export function detectMode(_models: ReadonlyArray<{ id: string }>): ProviderMode {
  return "simple"
}
