import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

export type Employee = {
  id_empleado: string
  created_at?: string
  id_empresa?: string | null
  nombre_completo: string
  cargo: string
  es_local_chimila: boolean
  activo: boolean
  nit_empresa: string
  imagen_hoja_vida?: string | null
}

export type EmployeeCompanyOption = {
  id_empresa: string | null
  nit: string
  nombre_comercial: string
}

export type EmployeeInput = {
  id_empresa?: string | null
  nombre_completo: string
  cargo: string
  es_local_chimila: boolean
  activo: boolean
  nit_empresa: string
  imagen_hoja_vida?: string | null
}

const EMPLOYEES_TABLE = "empleados"
const EMPLOYEE_FIELDS = "id_empleado, created_at, id_empresa, nombre_completo, cargo, es_local_chimila, activo, nit_empresa, imagen_hoja_vida"

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from(EMPLOYEES_TABLE)
    .select(EMPLOYEE_FIELDS)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Employee[]
}

export async function fetchEmployeeCompanyOptions(): Promise<EmployeeCompanyOption[]> {
  const { data, error } = await supabase
    .from(DICTIONARY_TABLES.empresa[0])
    .select("id_empresa, nit, nombre_comercial")
    .order("nombre_comercial", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? [])
    .map((row) => {
      const source = row as Record<string, unknown>
      return {
        id_empresa: source.id_empresa ? String(source.id_empresa) : null,
        nit: source.nit ? String(source.nit) : "",
        nombre_comercial: source.nombre_comercial ? String(source.nombre_comercial) : "Empresa sin nombre",
      }
    })
    .filter((company) => company.nit.length > 0)
}

export async function createEmployee(employee: EmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from(EMPLOYEES_TABLE)
    .insert(employee)
    .select(EMPLOYEE_FIELDS)
    .single()

  if (error || !data) throw new Error(error?.message ?? "No se pudo crear el empleado")
  return data as Employee
}

export async function updateEmployee(id: string, employee: EmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from(EMPLOYEES_TABLE)
    .update(employee)
    .eq("id_empleado", id)
    .select(EMPLOYEE_FIELDS)
    .single()

  if (error || !data) throw new Error(error?.message ?? "No se pudo actualizar el empleado")
  return data as Employee
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from(EMPLOYEES_TABLE)
    .delete()
    .eq("id_empleado", id)

  if (error) throw new Error(error.message)
}
