import { readStoredCredential } from "@earendil-works/pi-coding-agent"

export function timestamp(): string {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, "0")
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export function hasCredential(providerId: string): boolean {
  return readStoredCredential(providerId) !== undefined
}

export async function checkReachable(url: string, timeoutMs: number): Promise<{ ok: boolean, error?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await fetch(url, { method: "HEAD", signal: controller.signal })
    return { ok: true }
  }
  catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError")
        return { ok: false, error: `timeout after ${timeoutMs}ms` }
      return { ok: false, error: err.message }
    }
    return { ok: false, error: String(err) }
  }
  finally {
    clearTimeout(timer)
  }
}
