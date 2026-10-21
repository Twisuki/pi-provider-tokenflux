import type { Api, Model } from "@earendil-works/pi-ai"
import { getBuiltinModels, getBuiltinProviders } from "@earendil-works/pi-ai/providers/all"
import { DEFAULT_CONTEXT_WINDOW, DEFAULT_MAX_TOKENS, REFRESH_TIMEOUT_MS } from "./const.js"

export type TokenFluxApi = "anthropic-messages" | "openai-completions" | "openai-responses"

interface RawModel {
  id: string
  owned_by?: string
}

interface ModelsResponse {
  data?: unknown
}

export interface FetchModelsOptions {
  provider: string
  baseUrl: string
  apiKey: string
  signal?: AbortSignal
}

const BUILTIN = new Map<string, Map<string, Model<Api>>>()
for (const name of getBuiltinProviders()) {
  const byId = new Map<string, Model<Api>>()
  for (const model of getBuiltinModels(name)) {
    byId.set(model.id, model)
  }
  BUILTIN.set(name, byId)
}

const API_MAP: Partial<Record<Api, TokenFluxApi>> = {
  "anthropic-messages": "anthropic-messages",
  "openai-responses": "openai-responses",
  "azure-openai-responses": "openai-responses",
  "openai-codex-responses": "openai-responses",
}

function toTokenFluxApi(api: Api): TokenFluxApi {
  return API_MAP[api] ?? "openai-completions"
}

function apiBaseUrl(baseUrl: string, api: TokenFluxApi): string {
  return api === "anthropic-messages" ? baseUrl : `${baseUrl}/v1`
}

function findBuiltinModel(id: string, ownedBy: string | undefined): Model<Api> | undefined {
  const slashIdx = id.indexOf("/")
  const modelId = slashIdx > 0 ? id.slice(slashIdx + 1) : id

  if (slashIdx <= 0 && ownedBy) {
    const owned = BUILTIN.get(ownedBy)?.get(modelId)
    if (owned) {
      return owned
    }
  }
  const openai = BUILTIN.get("openai")?.get(modelId)
  if (openai) {
    return openai
  }
  for (const byId of BUILTIN.values()) {
    const found = byId.get(modelId)
    if (found) {
      return found
    }
  }
  return undefined
}

function isRawModel(value: unknown): value is RawModel {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as { id?: unknown, owned_by?: unknown }
  return typeof candidate.id === "string"
    && (candidate.owned_by === undefined || typeof candidate.owned_by === "string")
}

function createModel(entry: RawModel, provider: string, baseUrl: string): Model<TokenFluxApi> {
  const builtin = findBuiltinModel(entry.id, entry.owned_by)
  if (!builtin) {
    return {
      id: entry.id,
      name: entry.id,
      api: "openai-completions",
      provider,
      baseUrl: apiBaseUrl(baseUrl, "openai-completions"),
      input: ["text"],
      reasoning: false,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: DEFAULT_CONTEXT_WINDOW,
      maxTokens: DEFAULT_MAX_TOKENS,
    }
  }
  const api = toTokenFluxApi(builtin.api)
  const compat = builtin.api === api ? builtin.compat : undefined
  return {
    ...builtin,
    id: entry.id,
    provider,
    baseUrl: apiBaseUrl(baseUrl, api),
    api,
    compat: compat as Model<TokenFluxApi>["compat"],
  }
}

export function createModels(entries: readonly RawModel[], provider: string, baseUrl: string): Model<TokenFluxApi>[] {
  return entries.map(entry => createModel(entry, provider, baseUrl))
}

export async function fetchModels(options: FetchModelsOptions): Promise<readonly Model<TokenFluxApi>[]> {
  const { provider, baseUrl, apiKey, signal } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS)
  const merged = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal
  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: merged,
    })
    if (!res.ok) {
      return []
    }
    const body = await res.json() as ModelsResponse
    if (!Array.isArray(body.data)) {
      return []
    }
    return createModels(body.data.filter(isRawModel), provider, baseUrl)
  }
  catch {
    return []
  }
  finally {
    clearTimeout(timer)
  }
}
