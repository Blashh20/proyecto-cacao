"use client";

import type { PurchaseRow } from "@/model/profile";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

// Lista las compras o ventas asociadas al usuario dentro de su perfil.
export function PurchasesTab({ purchases }: { purchases: PurchaseRow[] }) {
  const [purchaseFilter, setPurchaseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const filteredPurchases = useMemo(() => {
    const value = purchaseFilter.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const matchesSearch =
        !value ||
        purchase.id.toString().includes(value) ||
        purchase.estado.toLowerCase().includes(value) ||
        new Date(purchase.fecha)
          .toLocaleDateString("es-CO")
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "all" || purchase.estado === statusFilter;

      const matchesYear =
        yearFilter === "all" ||
        new Date(purchase.fecha).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [purchases, purchaseFilter, statusFilter, yearFilter]);

  return (
    <section>
      {/* Filtros */}
      <div className="mt-2 grid gap-3 sm:grid-cols-3 bg-card p-4 rounded-xl border">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Estado
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          >
            <option value="all">Todos</option>

            {[...new Set(purchases.map((p) => p.estado))].map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Año
          </label>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-input px-4 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          >
            <option value="all">Todos</option>

            {[
              ...new Set(
                purchases.map((p) =>
                  new Date(p.fecha).getFullYear().toString()
                )
              ),
            ].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setPurchaseFilter("");
              setStatusFilter("all");
              setYearFilter("all");
            }}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-forest px-4 text-sm font-semibold text-foreground transition hover:bg-forest-dark/90"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className=" mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            value={purchaseFilter}
            onChange={(e) => setPurchaseFilter(e.target.value)}
            placeholder="Buscar compra, estado o fecha..."
            className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pl-9 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredPurchases.length} registros visibles
        </p>
      </div>

      {/* Tabla */}
      <div className="mt-4 overflow-x-auto bg-card rounded-xl border border-border">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground ">
              <th className="px-3 py-2">Compra</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>

          <tbody>
            {filteredPurchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-b border-border/40 text-sm"
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-foreground">
                    Compra #{purchase.id}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Registro de compra
                  </p>
                </td>

                <td className="px-3 py-3 text-muted-foreground">
                  {new Date(purchase.fecha).toLocaleDateString("es-CO")}
                </td>

                <td className="px-3 py-3 text-foreground">
                  {purchase.items} items
                </td>

                <td className="px-3 py-3">
                  <span className="font-semibold text-foreground">
                    ${purchase.total.toLocaleString("es-CO")} COP
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span
                    className={
                      purchase.estado.toLowerCase() === "completada"
                        ? "employee-chip employee-chip-green"
                        : purchase.estado.toLowerCase() === "pendiente"
                        ? "employee-chip"
                        : "employee-chip employee-chip-muted"
                    }
                  >
                    {purchase.estado}
                  </span>
                </td>
              </tr>
            ))}

            {filteredPurchases.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No hay compras para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}