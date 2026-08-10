import { createEffect, Suspense, type ParentProps } from "solid-js"
import { createStore } from "solid-js/store"
import { DebugBar } from "@/components/debug-bar"
import { TabsInfoPopup } from "@/components/help-button"
import { Titlebar, type TitlebarUpdate } from "@/components/titlebar"
import { usePlatform } from "@/context/platform"
import { setV2Toast, ToastRegion } from "@/utils/toast"
import topBan from '@/assets/top-ban.png'

export default function NewLayout(props: ParentProps) {
  const platform = usePlatform()
  const [state, setState] = createStore({ debugTools: true })

  createEffect(() => setV2Toast(true))

  const update: TitlebarUpdate = {
    version: () => {
      const state = platform.updater?.state()
      if (state?.status !== "ready") return
      return state.version
    },
    installing: () => platform.updater?.state().status === "installing",
    install: () => void platform.updater?.install(),
  }

  return (
    <div
      class="relative bg-v2-background-bg-deep flex-1 min-h-0 min-w-0 flex flex-col select-none [&_input]:select-text [&_textarea]:select-text [&_[contenteditable]]:select-text"
      style={{
        "padding-top": "env(safe-area-inset-top, 0px)",
        "padding-bottom": "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Titlebar
        update={update}
        debugTools={
          import.meta.env.DEV
            ? { visible: state.debugTools, toggle: () => setState("debugTools", (value) => !value) }
            : undefined
        }
      />
      <div
        class="w-full flex items-center justify-end shrink-0"
        style={{
          height: "100px",
          "background-color": "#ffffff",
          "background-image": `url(${topBan})`,
          "background-size": "auto",
          "background-position": "top left",
          "background-repeat": "no-repeat",
          border: "2px solid #4a90d9",
          "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.4)",
          "padding-right": "100px",
        }}
      >
        <span
          style={{
            "font-size": "50px",
            color: "blue",
            "font-weight": "bold",
            "line-height": "1",
            "text-shadow": "2px 2px 4px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 100, 255, 0.5)",
          }}
        >
          柯桥区税务局大企业风险分析系统
        </span>
      </div>
      <main class="flex-1 min-h-0 min-w-0 overflow-x-hidden flex flex-col items-start contain-strict">
        <Suspense>{props.children}</Suspense>
      </main>
      {import.meta.env.DEV && state.debugTools && <DebugBar inline />}
      <TabsInfoPopup />
      <ToastRegion v2 />
    </div>
  )
}
