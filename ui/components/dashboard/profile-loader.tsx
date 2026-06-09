export function ProfileLogoLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="flex flex-col items-center gap-5">
        <div className="profile-logo-loader" aria-label="Cargando perfil">
          <div className="profile-logo-loader-base" />
          <div className="profile-logo-loader-fill" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-forest-light">Makakaw</p>
          <p className="mt-2 text-sm text-muted-foreground">Cargando tu perfil...</p>
        </div>
      </div>
    </main>
  )
}
