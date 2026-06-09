"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

const DEFAULT_PUBLIC_POWER_BI_URL = process.env.NEXT_PUBLIC_POWER_BI_URL

function normalizePublicPowerBIUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  return `https://app.powerbi.com/view?r=${trimmed}`
}

type PowerBIReportProps = {
  title: string
  publicEmbedUrl?: string
  embedUrl?: string
  reportId?: string
  accessToken?: string
}

export function PowerBIReport({
  title,
  publicEmbedUrl,
  embedUrl,
  reportId,
  accessToken,
}: PowerBIReportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [message, setMessage] = useState("")

  const hasSecureEmbedConfig = Boolean(embedUrl && reportId && accessToken)
  const sanitizedPublicUrl = useMemo(() => normalizePublicPowerBIUrl(publicEmbedUrl), [publicEmbedUrl])
  const publicFrameUrl = sanitizedPublicUrl || (!hasSecureEmbedConfig ? DEFAULT_PUBLIC_POWER_BI_URL : undefined)

  useEffect(() => {
    const element = containerRef.current

    if (!element || publicFrameUrl || !hasSecureEmbedConfig) {
      return
    }

    const target = element
    setStatus("loading")
    setMessage("")

    let active = true
    let reset: (() => void) | undefined

    async function embedReport() {
      const [{ PowerBIService }, powerbiClient] = await Promise.all([
        import("@/services/power_bi-service"),
        import("powerbi-client"),
      ])

      if (!active) return

      const powerBIService = new PowerBIService()
      const config = {
        type: "report",
        id: reportId,
        embedUrl,
        accessToken,
        tokenType: powerbiClient.models.TokenType.Embed,
        settings: {
          panes: {
            filters: { expanded: false, visible: false },
            pageNavigation: { visible: true },
          },
          background: powerbiClient.models.BackgroundType.Transparent,
        },
      }

      const report = powerBIService.embedReport(target, config)

      report.on("loaded", () => setStatus("ready"))
      report.on("rendered", () => setStatus("ready"))
      report.on("error", (event) => {
        const detail = event?.detail as { message?: string } | undefined
        setStatus("error")
        setMessage(detail?.message || "No se pudo cargar el reporte de Power BI.")
      })

      reset = () => powerBIService.reset(target)
    }

    embedReport().catch((error: unknown) => {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el SDK de Power BI.")
    })

    return () => {
      active = false
      reset?.()
    }
  }, [accessToken, embedUrl, hasSecureEmbedConfig, publicFrameUrl, reportId])

  if (publicFrameUrl) {
    return (
      <PowerBIFrame title={title} src={publicFrameUrl} />
    )
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Reporte interactivo de Power BI</p>
        </div>
        {status === "error" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
            <AlertCircle size={14} />
            Error
          </span>
        ) : null}
      </div>
      <div className="relative min-h-[520px] bg-background">
        {status === "loading" ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 text-sm text-muted-foreground">
            Cargando Power BI...
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-background p-6 text-center">
            <p className="max-w-lg text-sm text-muted-foreground">{message}</p>
          </div>
        ) : null}
        <div ref={containerRef} className="h-[72vh] min-h-[520px] w-full" />
      </div>
    </article>
  )
}

function PowerBIFrame({ title, src }: { title: string; src: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">Reporte interactivo de Power BI</p>
      </div>
      <iframe
        title={title}
        src={src}
        allowFullScreen
        className="h-[72vh] min-h-[520px] w-full bg-background"
      />
    </article>
  )
}
