"use client"

import { useRef, useState, type DragEvent, type ChangeEvent } from "react"
import { CheckCircle2, FileSpreadsheet, ShieldCheck, Trash2, Upload, XCircle } from "lucide-react"

import { useCsvUploadController, AVAILABLE_TABLES, type CsvFileEntry } from "@/controller/csv-upload-controller"

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"

export function AdminCsvUpload() {
  const { user, files, isUploading, addFiles, removeFile, setFileTable, uploadAll, clearAll } =
    useCsvUploadController()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (user?.role !== "admin") return null

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    void addFiles(dropped)
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    void addFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const pendingCount = files.filter((f) => f.status === "pending" && f.table && f.rows.length > 0).length
  const hasFiles = files.length > 0

  return (
    <section id="admin-csv" className="border-y border-border bg-muted/30 py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 md:p-8">

          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
              <ShieldCheck size={18} />
              <span className="text-sm font-semibold uppercase tracking-widest">Administrador</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">
              Importar datos desde CSV
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sube uno o varios archivos <strong>.csv</strong> para cargarlos directamente en Supabase.
              Las columnas se detectan automáticamente.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={[
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              isDragging
                ? "border-forest bg-forest/5"
                : "border-border hover:border-forest/50 hover:bg-muted/50",
            ].join(" ")}
          >
            <FileSpreadsheet size={36} className="text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">
                Arrastra archivos CSV aquí o haz clic para seleccionarlos
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Puedes subir múltiples archivos a la vez
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* File list */}
          {hasFiles && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Archivos cargados ({files.length})
                </h3>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Limpiar todo
                </button>
              </div>

              {files.map((entry) => (
                <FileCard
                  key={entry.id}
                  entry={entry}
                  onRemove={() => removeFile(entry.id)}
                  onTableChange={(table) => setFileTable(entry.id, table)}
                />
              ))}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void uploadAll()}
                  disabled={isUploading || pendingCount === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload size={18} />
                  {isUploading
                    ? "Subiendo..."
                    : `Subir ${pendingCount > 0 ? `${pendingCount} archivo${pendingCount > 1 ? "s" : ""}` : "archivos"}`}
                </button>
                {pendingCount === 0 && !isUploading && (
                  <p className="text-sm text-muted-foreground">
                    Asigna una tabla a cada archivo para habilitarlo.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function FileCard({
  entry,
  onRemove,
  onTableChange,
}: {
  entry: CsvFileEntry
  onRemove: () => void
  onTableChange: (table: string) => void
}) {
  const statusIcon = {
    pending: null,
    uploading: <span className="text-xs text-forest animate-pulse">Subiendo…</span>,
    done: <CheckCircle2 size={18} className="text-green-500" />,
    error: <XCircle size={18} className="text-red-500" />,
  }[entry.status]

  const previewRows = entry.rows.slice(0, 3)

  return (
    <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileSpreadsheet size={18} className="shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-sm text-foreground">{entry.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            ({entry.rows.length} filas)
          </span>
          {statusIcon}
        </div>
        {entry.status !== "uploading" && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Table selector */}
      {entry.status === "pending" && (
        <div className="flex items-center gap-3">
          <label className="shrink-0 text-xs font-medium text-muted-foreground">Tabla destino:</label>
          <select
            value={entry.table ?? ""}
            onChange={(e) => { if (e.target.value) onTableChange(e.target.value) }}
            className={`${inputClassName} max-w-xs`}
          >
            <option value="">
              {entry.table ? "" : "— Seleccionar tabla —"}
            </option>
            {AVAILABLE_TABLES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          {entry.table && (
            <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
              {AVAILABLE_TABLES.find((t) => t.key === entry.table)?.label ?? entry.table}
            </span>
          )}
        </div>
      )}

      {/* Column headers detected */}
      {entry.headers.length > 0 && entry.status === "pending" && (
        <div className="flex flex-wrap gap-1">
          {entry.headers.map((h) => (
            <span key={h} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Preview table */}
      {previewRows.length > 0 && entry.status === "pending" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {entry.headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {entry.headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-foreground max-w-[200px] truncate" title={row[h]}>
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {entry.rows.length > 3 && (
            <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
              … y {entry.rows.length - 3} filas más
            </p>
          )}
        </div>
      )}

      {/* Result summary */}
      {entry.status === "done" && (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
          ✓ {entry.inserted} filas insertadas correctamente en <strong>{entry.table}</strong>.
        </p>
      )}
      {entry.status === "error" && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400 space-y-1">
          {entry.inserted > 0 && <p>✓ {entry.inserted} filas insertadas.</p>}
          {entry.errors.map((err, i) => (
            <p key={i}>✗ {err}</p>
          ))}
        </div>
      )}
    </div>
  )
}
