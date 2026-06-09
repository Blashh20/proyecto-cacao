"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, BarChart3, ExternalLink } from "lucide-react"

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
  const sanitizedPublicUrl = useMemo(() => publicEmbedUrl?.trim(), [publicEmbedUrl])

  useEffect(() => {
    const element = containerRef.current

    if (!element || sanitizedPublicUrl || !hasSecureEmbedConfig) {
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
  }, [accessToken, embedUrl, hasSecureEmbedConfig, reportId, sanitizedPublicUrl])

  if (sanitizedPublicUrl) {
    return (
      <PowerBIFrame title={title} src={sanitizedPublicUrl} />
    )
  }

  if (!hasSecureEmbedConfig) {
    return (
      <article className="rounded-2xl border border-dashed border-border bg-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest/15 text-forest-light">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Configura el enlace de insercion de Power BI para mostrar aqui las graficas del reporte.
              </p>
            </div>
          </div>
          <a
            href="https://app.powerbi.com/view?r=eyJrIjoiZTA5N2VkYWQtYmNiMS00YWFmLWEwZWQtOGY4MmExNTlmZjllIiwidCI6ImMyOGQyZTEyLTA5ODgtNGFjZi1iZGJhLTExOTU4MmU4ZDA4ZCIsImMiOjl9"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-background"
          >
            <ExternalLink size={16} />
            Abrir Power BI
          </a>
        </div>
      </article>
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
