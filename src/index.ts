import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { registerCommands } from "./commands.js"
import { restoreProviders } from "./provider.js"

export default function (pi: ExtensionAPI): void {
  registerCommands(pi)
  restoreProviders(pi)
}
