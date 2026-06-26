"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Building2,
  Check,
  Eye,
  ExternalLink,
  FileImage,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import {
  createEmployee,
  deleteEmployee,
  fetchEmployeeCompanyOptions,
  fetchEmployees,
  updateEmployee,
  type Employee,
  type EmployeeCompanyOption,
  type EmployeeInput,
} from "@/services/employees-service";
import { uploadImage } from "@/services/storage";

const emptyForm: EmployeeInput = {
  id_empresa: null,
  nit_empresa: "",
  nombre_completo: "",
  cargo: "",
  es_local_chimila: false,
  activo: true,
  imagen_hoja_vida: null,
};

export function AdminEmployeesPanel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<EmployeeCompanyOption[]>([]);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "activo" | "inactivo">("all");
  const [originFilter, setOriginFilter] = useState<"all" | "local" | "externo">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEmployeesModule() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const [employeesData, companyOptions] = await Promise.all([
          fetchEmployees(),
          fetchEmployeeCompanyOptions(),
        ]);

        if (!isMounted) return;
        setEmployees(employeesData);
        setCompanies(companyOptions);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el modulo de empleados.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadEmployeesModule();

    return () => {
      isMounted = false;
    };
  }, []);

  const companiesByNit = useMemo(() => {
    return new Map(companies.map((company) => [company.nit, company]));
  }, [companies]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return employees.filter((employee) => {
      const company = companiesByNit.get(employee.nit_empresa);
      const matchesQuery =
        !normalizedQuery ||
        [
          employee.nombre_completo,
          employee.cargo,
          employee.nit_empresa,
          company?.nombre_comercial,
          employee.activo ? "activo" : "inactivo",
          employee.es_local_chimila ? "chimila" : "externo",
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      const matchesCompany =
        !companyFilter || employee.nit_empresa === companyFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "activo" ? employee.activo : !employee.activo);
      const matchesOrigin =
        originFilter === "all" ||
        (originFilter === "local" ? employee.es_local_chimila : !employee.es_local_chimila);

      return matchesQuery && matchesCompany && matchesStatus && matchesOrigin;
    });
  }, [companiesByNit, employees, query, companyFilter, statusFilter, originFilter]);

  const activeCount = employees.filter((employee) => employee.activo).length;
  const localCount = employees.filter(
    (employee) => employee.es_local_chimila,
  ).length;

  const selectCompany = (nitEmpresa: string) => {
    const company = companiesByNit.get(nitEmpresa);
    setForm((current) => ({
      ...current,
      nit_empresa: nitEmpresa,
      id_empresa: company?.id_empresa ?? null,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");

    const payload: EmployeeInput = {
      ...form,
      nombre_completo: form.nombre_completo.trim(),
      cargo: form.cargo.trim(),
      nit_empresa: form.nit_empresa.trim(),
      id_empresa: form.id_empresa || null,
      imagen_hoja_vida: form.imagen_hoja_vida || null,
    };

    if (!payload.nombre_completo || !payload.cargo || !payload.nit_empresa) {
      setErrorMessage("Completa nombre, cargo y empresa antes de guardar.");
      return;
    }

    try {
      setIsSaving(true);
      const savedEmployee = editingId
        ? await updateEmployee(editingId, payload)
        : await createEmployee(payload);

      setEmployees((current) => {
        if (!editingId) return [savedEmployee, ...current];
        return current.map((employee) =>
          employee.id_empleado === editingId ? savedEmployee : employee,
        );
      });

      setNotice(
        editingId
          ? "Empleado actualizado correctamente."
          : "Empleado registrado correctamente.",
      );
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el empleado.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (employee: Employee) => {
    setNotice("");
    setErrorMessage("");
    setEditingId(employee.id_empleado);
    setForm({
      id_empresa: employee.id_empresa ?? null,
      nit_empresa: employee.nit_empresa,
      nombre_completo: employee.nombre_completo,
      cargo: employee.cargo,
      es_local_chimila: employee.es_local_chimila,
      activo: employee.activo,
      imagen_hoja_vida: employee.imagen_hoja_vida ?? null,
    });
  };

  const handleResumeImageSelect = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNotice("");
    setErrorMessage("");

    try {
      setIsUploadingResume(true);
      const publicUrl = await uploadImage(file, "Galeria");
      setForm((current) => ({ ...current, imagen_hoja_vida: publicUrl }));
      setNotice(
        "Imagen de hoja de vida subida. Guarda el empleado para conservar la URL.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen de la hoja de vida.",
      );
    } finally {
      setIsUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const toggleEmployeeStatus = async (employee: Employee) => {
    setNotice("");
    setErrorMessage("");

    try {
      const updated = await updateEmployee(employee.id_empleado, {
        id_empresa: employee.id_empresa ?? null,
        nit_empresa: employee.nit_empresa,
        nombre_completo: employee.nombre_completo,
        cargo: employee.cargo,
        es_local_chimila: employee.es_local_chimila,
        activo: !employee.activo,
        imagen_hoja_vida: employee.imagen_hoja_vida ?? null,
      });

      setEmployees((current) =>
        current.map((item) =>
          item.id_empleado === employee.id_empleado ? updated : item,
        ),
      );
      setNotice(
        updated.activo ? "Empleado activado." : "Empleado desactivado.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado.",
      );
    }
  };

  const removeEmployee = async (employee: Employee) => {
    const shouldDelete = window.confirm(
      `Eliminar a ${employee.nombre_completo}? Esta accion no se puede deshacer.`,
    );
    if (!shouldDelete) return;

    setNotice("");
    setErrorMessage("");

    try {
      await deleteEmployee(employee.id_empleado);
      setEmployees((current) =>
        current.filter((item) => item.id_empleado !== employee.id_empleado),
      );
      if (editingId === employee.id_empleado) resetForm();
      setNotice("Empleado eliminado.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el empleado.",
      );
    }
  };

  return (
    <section id="admin-empleados" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 pb-5">
        <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-forest-light">
                <UserRound size={18} />
                <p className="text-sm font-semibold uppercase tracking-[0.12em]">
                  Talento humano
                </p>
              </div>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                Modulo de empleados
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Gestiona empleados por empresa, cargo, pertenencia local Chimila
                y estado operativo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <EmployeeStat
                label="Total"
                value={isLoading ? "..." : employees.length.toString()}
              />
              <EmployeeStat
                label="Activos"
                value={isLoading ? "..." : activeCount.toString()}
              />
              <EmployeeStat
                label="Chimila"
                value={isLoading ? "..." : localCount.toString()}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-3 rounded-xl border border-border bg-background/35 p-3 lg:grid-cols-12"
          >
            <EmployeeField className="lg:col-span-3" label="Nombre completo">
              <input
                value={form.nombre_completo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nombre_completo: event.target.value,
                  }))
                }
                className="employee-input"
                placeholder="Nombre del empleado"
              />
            </EmployeeField>
            <EmployeeField className="lg:col-span-3" label="Cargo">
              <select
                value={form.cargo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cargo: event.target.value,
                  }))
                }
                className="employee-input" // Añadí 'bg-white' por si el navegador le pone un fondo gris por defecto
              >
                <option value="" disabled>
                  Selecciona un cargo...
                </option>
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Operario">Operario</option>
                <option value="Soporte Técnico">Soporte Técnico</option>
                {/* Puedes agregar aquí los roles que necesites */}
              </select>
            </EmployeeField>
            <EmployeeField className="lg:col-span-3" label="Empresa">
              <select
                value={form.nit_empresa}
                onChange={(event) => selectCompany(event.target.value)}
                className="employee-input"
              >
                <option value="">Selecciona empresa</option>
                {companies.map((company) => (
                  <option key={company.nit} value={company.nit}>
                    {company.nombre_comercial} - {company.nit}
                  </option>
                ))}
              </select>
            </EmployeeField>
            <div className="grid gap-2 sm:grid-cols-2 lg:col-span-2 lg:self-end">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-input px-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.es_local_chimila}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      es_local_chimila: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-forest"
                />
                Local Chimila
              </label>
              <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-input px-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      activo: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-forest"
                />
                Activo
              </label>
            </div>
            <div className="flex gap-2 lg:col-span-2 lg:self-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId ? <Check size={16} /> : <Plus size={16} />}
                {isSaving ? "Guardando" : editingId ? "Actualizar" : "Crear"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-input"
                  title="Cancelar edicion"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
            <div className="rounded-xl border border-border bg-input p-3 lg:col-span-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest-light">
                    <FileImage size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Imagen de hoja de vida
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Se sube a Supabase Storage y se guarda la URL en
                      empleados.imagen_hoja_vida.
                    </p>
                    {form.imagen_hoja_vida ? (
                      <a
                        href={form.imagen_hoja_vida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-forest/40 px-3 text-xs font-semibold text-forest-light transition hover:bg-forest/10"
                      >
                        <Eye size={14} />
                        Visualizar hoja de vida
                        <ExternalLink size={12} />
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleResumeImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-forest px-4 text-sm font-semibold text-forest-light transition hover:bg-forest/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload size={16} />
                    {isUploadingResume ? "Subiendo..." : "Subir imagen"}
                  </button>
                  {form.imagen_hoja_vida ? (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          imagen_hoja_vida: null,
                        }))
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-background"
                      title="Quitar imagen"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </form>

          {notice ? (
            <div className="mt-3 rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">
              {notice}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Empresa
              </label>
              <select
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
              >
                <option value="">Todas las empresas</option>
                {companies.map((company) => (
                  <option key={company.nit} value={company.nit}>
                    {company.nombre_comercial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "activo" | "inactivo")}
                className="w-full rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
              >
                <option value="all">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Origen
              </label>
              <select
                value={originFilter}
                onChange={(event) => setOriginFilter(event.target.value as "all" | "local" | "externo")}
                className="w-full rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
              >
                <option value="all">Todos</option>
                <option value="local">Local Chimila</option>
                <option value="externo">Externo</option>
              </select>
            </div>

            <div className="flex items-end justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setCompanyFilter("");
                  setStatusFilter("all");
                  setOriginFilter("all");
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-input"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pl-9 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                placeholder="Buscar empleado, cargo o empresa"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredEmployees.length} registros visibles
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2">Empleado</th>
                  <th className="px-3 py-2">Cargo</th>
                  <th className="px-3 py-2">Empresa</th>
                  <th className="px-3 py-2">Origen</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Hoja de vida</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const company = companiesByNit.get(employee.nit_empresa);
                  return (
                    <tr
                      key={employee.id_empleado}
                      className="border-b border-border/40 text-sm"
                    >
                      <td className="px-3 py-3">
                        <p className="font-semibold text-foreground">
                          {employee.nombre_completo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.id_empleado}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {employee.cargo}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Building2
                            size={15}
                            className="mt-1 text-forest-light"
                          />
                          <div>
                            <p className="text-foreground">
                              {company?.nombre_comercial ?? "Empresa vinculada"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              NIT {employee.nit_empresa}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            employee.es_local_chimila
                              ? "employee-chip employee-chip-green"
                              : "employee-chip"
                          }
                        >
                          {employee.es_local_chimila
                            ? "Local Chimila"
                            : "Externo"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            employee.activo
                              ? "employee-chip employee-chip-green"
                              : "employee-chip employee-chip-muted"
                          }
                        >
                          {employee.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {employee.imagen_hoja_vida ? (
                          <a
                            href={employee.imagen_hoja_vida}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-forest/40 px-3 text-xs font-semibold text-forest-light transition hover:bg-forest/10"
                          >
                            <Eye size={14} />
                            Visualizar
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin imagen</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(employee)}
                            className="employee-icon-button"
                            title="Editar empleado"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleEmployeeStatus(employee)}
                            className="employee-icon-button"
                            title={
                              employee.activo
                                ? "Desactivar empleado"
                                : "Activar empleado"
                            }
                          >
                            {employee.activo ? (
                              <X size={15} />
                            ) : (
                              <Check size={15} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEmployee(employee)}
                            className="employee-icon-button text-red-200 hover:border-red-300/50 hover:bg-red-500/10"
                            title="Eliminar empleado"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-sm text-muted-foreground"
                    >
                      No hay empleados para mostrar.
                    </td>
                  </tr>
                ) : null}
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-sm text-muted-foreground"
                    >
                      Cargando empleados...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployeeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-xl border border-border bg-background/40 px-3 py-2">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmployeeField({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
