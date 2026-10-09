import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { registerCommands } from "./commands.js"

export default function (pi: ExtensionAPI): void {
  registerCommands(pi)

  // TODO: restore previously added providers from the persisted config file
}
