import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { emptyConfig, readConfig, writeConfig } from "./config.js"
import { COMMAND_ADD, COMMAND_LIST, COMMAND_REMOVE, REACHABILITY_TIMEOUT_MS, TOKENFLUX_BASE_URL } from "./const.js"
import { deleteModels, readModels } from "./models.js"
import { buildProvider } from "./provider.js"
import { checkReachable, hasCredential } from "./utils.js"

function registerAddCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_ADD, {
    description: "Add a TokenFlux provider.",
    handler: async (args, ctx) => {
      const trimmedArgs = args.trim()
      const name = trimmedArgs || await ctx.ui.input("Provider name:", "my-tokenflux")
      if (!name)
        return

      const existing = readConfig()
      if (existing && existing.providers.includes(name)) {
        ctx.ui.notify(`Provider "${name}" already exists.`, "error")
        return
      }

      const reach = await checkReachable(TOKENFLUX_BASE_URL, REACHABILITY_TIMEOUT_MS)
      if (!reach.ok) {
        ctx.ui.notify(`Reachability warning: ${reach.error} (continuing anyway)`, "warning")
      }

      try {
        const provider = buildProvider(name)
        pi.registerProvider(provider)
      }
      catch (err) {
        ctx.ui.notify(`Failed to build provider: ${err instanceof Error ? err.message : String(err)}`, "error")
        return
      }

      const config = readConfig() ?? emptyConfig()
      config.providers.push(name)
      writeConfig(config)

      ctx.ui.notify(`Provider "${name}" added. Run /login ${name} to authenticate.`, "info")
    },
  })
}

function registerRemoveCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_REMOVE, {
    description: "Remove a previously added TokenFlux provider.",
    handler: async (args, ctx) => {
      const name = args.trim()
      if (!name) {
        ctx.ui.notify("Usage: /tf-provider-remove <name>", "warning")
        return
      }

      if (hasCredential(name)) {
        ctx.ui.notify(`Provider "${name}" has a stored credential. Run /logout ${name} first.`, "error")
        return
      }

      const config = readConfig()
      if (!config || !config.providers.includes(name)) {
        ctx.ui.notify(`Provider "${name}" not found.`, "error")
        return
      }

      config.providers = config.providers.filter(n => n !== name)
      writeConfig(config)
      pi.unregisterProvider(name)
      deleteModels(name)

      ctx.ui.notify(`Provider "${name}" removed.`, "info")
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

      const lines = config.providers.map((name) => {
        const auth = hasCredential(name) ? "auth: true" : "auth: false"
        const models = readModels(name)
        const mode = models?.mode ?? "---"
        const lastRefresh = models?.lastRefreshedAt ?? "---"
        return `${name} | ${auth} | ${mode} | ${lastRefresh}`
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
