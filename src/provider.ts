export type ProviderMode = "simple" | "composite"

export interface RefreshContext {
  signal: AbortSignal
  publish: (update: { update: Provider }) => void
}

export type Provider = unknown

export function buildProvider(_name: string, _baseUrl: string): Provider {
  // TODO: construct the real Provider, delegating stream to pi's built-in OpenAI Chat Completions
  throw new Error("buildProvider: not implemented yet")
}

export async function refreshModels(
  _context: RefreshContext,
  _baseUrl: string,
  _apiKey: string,
): Promise<void> {
  // TODO: implement 15s-timeout fetch of /v1/models, map to pi Model shape, publish via context.publish, persist to catalog-store, swallow errors silently
  throw new Error("refreshModels: not implemented yet")
}

export function detectMode(_models: ReadonlyArray<{ id: string }>): ProviderMode {
  // TODO: return "composite" if any id contains "/", else "simple"
  return "simple"
}
