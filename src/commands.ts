import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { emptyConfig, readConfig, writeConfig } from "./config.js"
import { COMMAND_ADD, COMMAND_LIST, COMMAND_REMOVE, PROVIDER_ID_PREFIX, REACHABILITY_TIMEOUT_MS, TOKENFLUX_BASE_URL } from "./const.js"
import { buildProvider } from "./provider.js"
import { checkReachable, hasCredential } from "./utils.js"

function registerAddCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_ADD, {
    description: "Add a TokenFlux provider (id is prefixed with tf-).",
    handler: async (args, ctx) => {
      const trimmedArgs = args.trim()
      const name = trimmedArgs || await ctx.ui.input("Provider name:", "demo")
      if (!name)
        return
      const id = `${PROVIDER_ID_PREFIX}${name}`

      const existing = readConfig()
      if (existing && existing.providers.includes(id)) {
        ctx.ui.notify(`Provider "${id}" already exists.`, "error")
        return
      }

      const reach = await checkReachable(TOKENFLUX_BASE_URL, REACHABILITY_TIMEOUT_MS)
      if (!reach.ok) {
        ctx.ui.notify(`Reachability warning: ${reach.error} (continuing anyway)`, "warning")
      }

      try {
        const provider = buildProvider(id)
        pi.registerProvider(provider)
      }
      catch (err) {
        ctx.ui.notify(`Failed to build provider: ${err instanceof Error ? err.message : String(err)}`, "error")
        return
      }

      const config = readConfig() ?? emptyConfig()
      config.providers.push(id)
      writeConfig(config)

      ctx.ui.notify(`Provider "${id}" added. Run /login ${id} to authenticate.`, "info")
    },
  })
}

function registerRemoveCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_REMOVE, {
    description: "Remove a TokenFlux provider.",
    handler: async (args, ctx) => {
      const id = args.trim()
      if (!id) {
        ctx.ui.notify("Usage: /tf-provider-remove <id>", "warning")
        return
      }

      if (hasCredential(id)) {
        ctx.ui.notify(`Provider "${id}" has a stored credential. Run /logout first.`, "error")
        return
      }

      const config = readConfig()
      if (!config || !config.providers.includes(id)) {
        ctx.ui.notify(`Provider "${id}" not found.`, "error")
        return
      }

      config.providers = config.providers.filter(n => n !== id)
      writeConfig(config)
      pi.unregisterProvider(id)

      ctx.ui.notify(`Provider "${id}" removed.`, "info")
    },
  })
}

function registerListCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_LIST, {
    description: "List added TokenFlux providers with their current status.",
    handler: async (_args, ctx) => {
      const config = readConfig()
      if (!config || config.providers.length === 0) {
        ctx.ui.notify("No TokenFlux providers configured. Run /tf-provider-add to add one.", "info")
        return
      }

      const lines = config.providers.map((id) => {
        const auth = hasCredential(id) ? "auth: true" : "auth: false"
        return `${id} | ${auth}`
      })
      ctx.ui.notify(`TokenFlux providers (${config.providers.length}):\n${lines.join("\n")}`, "info")
    },
  })
}

export function registerCommands(pi: ExtensionAPI): void {
  registerAddCommand(pi)
  registerRemoveCommand(pi)
  registerListCommand(pi)
}
