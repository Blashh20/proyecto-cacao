"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/controller/auth-controller"
import { supabase } from "@/services/client"

type TableKey = keyof typeof TABLE_CONFIGS

interface TableConfig {
  label: string
  detect: (cols: string[]) => boolean
  mapRow: (row: Record<string, string>) => Record<string, unknown>
}

const TABLE_CONFIGS: Record<string, TableConfig> = {
  productos_derivados: {
    label: "Productos Derivados",
    detect: (cols) => cols.includes("nombre_derivado"),
    mapRow: (row) => ({
      nombre_derivado: row.nombre_derivado?.trim() ?? "",
      descripcion: (row.descripcion_tecnica ?? row.descripcion)?.trim() ?? "",
      imagen_url: row.imagen_url?.trim() || "/images/cacao-beans.jpg",
      tag: row.tag?.trim() || "Natural",
      rating: row.rating ? Number(row.rating) : 4.8,
    }),
  },
  regiones: {
    label: "Regiones",
    detect: (cols) => cols.includes("nombre_region") && cols.includes("pais"),
    mapRow: (row) => ({
      nombre_region: row.nombre_region?.trim() ?? "",
      pais: row.pais?.trim() ?? "",
    }),
  },
}

export const AVAILABLE_TABLES = Object.entries(TABLE_CONFIGS).map(([key, cfg]) => ({
  key,
  label: cfg.label,
}))

export interface CsvFileEntry {
  id: string
  name: string
  table: string | null
  headers: string[]
  rows: Record<string, string>[]
  status: "pending" | "uploading" | "done" | "error"
  inserted: number
  errors: string[]
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim().length > 0)

  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = splitCSVLine(lines[0])
  const rows = lines.slice(1).map((line) => {
    const values = splitCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))
  })

  return { headers, rows }
}

function detectTable(headers: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase())
  for (const [key, cfg] of Object.entries(TABLE_CONFIGS)) {
    if (cfg.detect(lower)) return key
  }
  return null
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`))
    reader.readAsText(file, "UTF-8")
  })
}

export function useCsvUploadController() {
  const { user } = useAuth()
  const [files, setFiles] = useState<CsvFileEntry[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const addFiles = useCallback(async (fileList: File[]) => {
    const csvFiles = fileList.filter((f) => f.name.toLowerCase().endsWith(".csv"))
    if (csvFiles.length === 0) return

    const newEntries: CsvFileEntry[] = await Promise.all(
      csvFiles.map(async (file) => {
        try {
          const text = await readFileAsText(file)
          const { headers, rows } = parseCSV(text)
          const table = detectTable(headers)
          return {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            table,
            headers,
            rows,
            status: "pending" as const,
            inserted: 0,
            errors: [],
          }
        } catch {
          return {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            table: null,
            headers: [],
            rows: [],
            status: "error" as const,
            inserted: 0,
            errors: ["No se pudo leer el archivo"],
          }
        }
      })
    )

    setFiles((prev) => [...prev, ...newEntries])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const setFileTable = useCallback((id: string, table: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, table, status: "pending", inserted: 0, errors: [] } : f))
    )
  }, [])

  const uploadAll = useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending" && f.table && f.rows.length > 0)
    if (pending.length === 0) return

    setIsUploading(true)

    for (const entry of pending) {
      if (!entry.table) continue
      const config = TABLE_CONFIGS[entry.table]
      if (!config) continue

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading" } : f))
      )

      const payload = entry.rows.map((row) => config.mapRow(row))
      const BATCH = 100
      let totalInserted = 0
      const batchErrors: string[] = []

      for (let i = 0; i < payload.length; i += BATCH) {
        const batch = payload.slice(i, i + BATCH)
        const { error } = await supabase.from(entry.table).insert(batch)

        if (error) {
          batchErrors.push(`Filas ${i + 1}–${i + batch.length}: ${error.message}`)
        } else {
          totalInserted += batch.length
        }
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? {
                ...f,
                status: batchErrors.length === 0 ? "done" : "error",
                inserted: totalInserted,
                errors: batchErrors,
              }
            : f
        )
      )
    }

    setIsUploading(false)
  }, [files])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  return {
    user,
    files,
    isUploading,
    addFiles,
    removeFile,
    setFileTable,
    uploadAll,
    clearAll,
  }
}
