import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import { CONFIG_FILE_NAME, SCHEMA_VERSION, SETTINGS_DIR } from "./const.js"
import { timestamp } from "./utils.js"

export interface Config {
  version: number
  providers: string[]
}

function settingsPath(): string {
  return join(getAgentDir(), SETTINGS_DIR, CONFIG_FILE_NAME)
}

function backupCorrupt(filePath: string): void {
  try {
    renameSync(filePath, `${filePath}.${timestamp()}.bak`)
  }
  catch {}
}

export function emptyConfig(): Config {
  return { version: SCHEMA_VERSION, providers: [] }
}

export function readConfig(): Config | null {
  const path = settingsPath()
  if (!existsSync(path))
    return null
  try {
    const raw = readFileSync(path, "utf-8")
    const parsed = JSON.parse(raw) as { version?: unknown, providers?: unknown }
    if (parsed.version !== SCHEMA_VERSION) {
      backupCorrupt(path)
      return null
    }
    if (!Array.isArray(parsed.providers) || !parsed.providers.every(n => typeof n === "string")) {
      backupCorrupt(path)
      return null
    }
    return { version: SCHEMA_VERSION, providers: parsed.providers }
  }
  catch {
    backupCorrupt(path)
    return null
  }
}

export function writeConfig(config: Config): void {
  const dir = join(getAgentDir(), SETTINGS_DIR)
  mkdirSync(dir, { recursive: true })
  writeFileSync(settingsPath(), `${JSON.stringify(config, null, 2)}\n`, "utf-8")
}
