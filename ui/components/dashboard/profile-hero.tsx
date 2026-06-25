"use client"

import { BadgeCheck, Shield } from "lucide-react"
import Image from "next/image"

import type { Tab } from "@/model/profile"

// Muestra la cabecera del perfil con avatar, identidad, rol y navegacion por tabs.
export function ProfileHero({
  fullName,
  email,
  role,
  avatarUrl,
  foto_url,
  activeTab,
  setActiveTab,
  tabs,
}: {
  fullName: string
  email: string
  role: string
  avatarUrl: string
  foto_url: string
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  tabs: { id: Tab; label: string }[]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative h-52 bg-[linear-gradient(135deg,#14231d_0%,#315f4a_52%,#d7a84d_100%)] md:h-64">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/70 to-transparent" />
      </div>
      <div className="px-5 pb-4 md:px-8">
        <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="mt-2 flex items-end gap-4">
            <Image
              src={foto_url || avatarUrl}
              alt="Foto de perfil"
              width={144}
              height={144}
              className="z-10 h-28 w-28 rounded-full border-4 border-card object-cover md:h-36 md:w-36"
            />
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                <BadgeCheck size={14} />
                Perfil comercial cacaotero
              </p>
            </div>
          </div>
          <div className="pb-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-sm font-semibold text-forest">
              <Shield size={16} />
              {role}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-3 md:px-8">
        <div className="flex min-w-max gap-1 overflow-x-auto py-2 justify-start md:justify-center scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-forest text-white" : "text-muted-foreground hover:bg-background"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
