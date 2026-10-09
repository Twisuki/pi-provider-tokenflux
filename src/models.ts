import type { ProviderMode } from "./provider.js"
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import { MODELS_FILE_NAME, SCHEMA_VERSION } from "./const.js"
import { timestamp } from "./utils.js"

export interface ModelEntry {
  id: string
  name?: string
  contextWindow?: number
  maxTokens?: number
}

export interface Models {
  lastRefreshedAt: string
  mode: ProviderMode
  entries: ModelEntry[]
}

export interface ModelsStore {
  version: number
  providers: Record<string, Models>
}

function storePath(): string {
  return join(getAgentDir(), MODELS_FILE_NAME)
}

function backupCorrupt(filePath: string): void {
  try {
    renameSync(filePath, `${filePath}.${timestamp()}.bak`)
  }
  catch {}
}

function emptyStore(): ModelsStore {
  return { version: SCHEMA_VERSION, providers: {} }
}

function isModelEntry(value: unknown): value is ModelEntry {
  if (typeof value !== "object" || value === null)
    return false
  const m = value as { id?: unknown, name?: unknown, contextWindow?: unknown, maxTokens?: unknown }
  if (typeof m.id !== "string")
    return false
  if (m.name !== undefined && typeof m.name !== "string")
    return false
  if (m.contextWindow !== undefined && typeof m.contextWindow !== "number")
    return false
  if (m.maxTokens !== undefined && typeof m.maxTokens !== "number")
    return false
  return true
}

function isModels(value: unknown): value is Models {
  if (typeof value !== "object" || value === null)
    return false
  const c = value as { lastRefreshedAt?: unknown, mode?: unknown, entries?: unknown }
  if (typeof c.lastRefreshedAt !== "string")
    return false
  if (c.mode !== "simple" && c.mode !== "composite")
    return false
  if (!Array.isArray(c.entries))
    return false
  return c.entries.every(isModelEntry)
}

export function readModelsStore(): ModelsStore {
  const path = storePath()
  if (!existsSync(path))
    return emptyStore()
  try {
    const raw = readFileSync(path, "utf-8")
    const parsed = JSON.parse(raw) as { version?: unknown, providers?: unknown }
    if (parsed.version !== SCHEMA_VERSION) {
      backupCorrupt(path)
      return emptyStore()
    }
    if (typeof parsed.providers !== "object" || parsed.providers === null || Array.isArray(parsed.providers)) {
      backupCorrupt(path)
      return emptyStore()
    }
    const providers: Record<string, Models> = {}
    for (const [name, value] of Object.entries(parsed.providers as Record<string, unknown>)) {
      if (isModels(value))
        providers[name] = value
    }
    return { version: SCHEMA_VERSION, providers }
  }
  catch {
    backupCorrupt(path)
    return emptyStore()
  }
}

export function readModels(name: string): Models | null {
  return readModelsStore().providers[name] ?? null
}

export function writeModels(name: string, models: Models): void {
  const store = readModelsStore()
  store.providers[name] = models
  const path = storePath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, "utf-8")
}

export function deleteModels(name: string): void {
  const store = readModelsStore()
  if (!(name in store.providers))
    return
  delete store.providers[name]
  const path = storePath()
  if (Object.keys(store.providers).length === 0) {
    try {
      renameSync(path, `${path}.${timestamp()}.bak`)
    }
    catch {}
    return
  }
  writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, "utf-8")
}
