import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { COMMAND_ADD, COMMAND_LIST, COMMAND_REMOVE } from "./const.js"

function registerAddCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_ADD, {
    description: "Add a TokenFlux provider.",
    handler: async (_args, ctx) => {
      // TODO: implement add flow (interactive baseUrl prompt, normalize, reachability check, persist)
      ctx.ui.notify("tf-provider-add: not implemented yet", "warning")
    },
  })
}

function registerRemoveCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_REMOVE, {
    description: "Remove a previously added TokenFlux provider.",
    handler: async (_args, ctx) => {
      // TODO: implement remove flow (prompt to /logout first, then unregister and clear persistence)
      ctx.ui.notify("tf-provider-remove: not implemented yet", "warning")
    },
  })
}

function registerListCommand(pi: ExtensionAPI): void {
  pi.registerCommand(COMMAND_LIST, {
    description: "List added TokenFlux providers with their current status.",
    handler: async (_args, ctx) => {
      // TODO: implement list flow (read config + catalog-store, print table)
      ctx.ui.notify("tf-provider-list: not implemented yet", "warning")
    },
  })
}

export function registerCommands(pi: ExtensionAPI): void {
  registerAddCommand(pi)
  registerRemoveCommand(pi)
  registerListCommand(pi)
}
