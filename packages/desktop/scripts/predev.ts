import { $ } from "bun"
import { downloadCliToResources } from "./utils"

await $`bun run install-electron`

await $`bun ./scripts/copy-icons.ts ${process.env.OPENCODE_CHANNEL ?? "dev"}`

await $`cd ../opencode && bun script/build-node.ts`
// v2 侧车 CLI 仅在显式启用时下载，与运行时开关保持一致 (index.ts 中的 OPENCODE_SIDECAR_V2)
if (process.env.OPENCODE_SIDECAR_V2 === "1") {
  await downloadCliToResources()
}
