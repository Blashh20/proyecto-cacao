"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { Check, Eye, EyeOff, UserPlus, X } from "lucide-react";

import { cn } from "@/ui/utils";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onLoginWithProvider: (provider: Provider) => Promise<void>;
  onRegister: (input: {
    tipo_identificacion: string;
    numero_identificacion: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    email: string;
    telefono_celular: string;
    password: string;
  }) => Promise<void>;
}

export function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onLoginWithProvider,
  onRegister,
}: RegisterModalProps) {
  const [formData, setFormData] = useState({
    tipo_identificacion: "",
    numero_identificacion: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    email: "",
    telefono_celular: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordRequirements = [
    { label: "Minimo 8 caracteres", met: formData.password.length >= 8 },
    { label: "Al menos una mayuscula", met: /[A-Z]/.test(formData.password) },
    { label: "Al menos un numero", met: /[0-9]/.test(formData.password) },
  ];

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => {
  const { name, value } = e.target;

  const numericFields = [
    "numero_identificacion",
    "telefono_celular",
  ];

  const newValue = numericFields.includes(name)
    ? value.replace(/\D/g, "")
    : value;

  setFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));

  setError("");
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("La contrasena no cumple con los requisitos");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los terminos y condiciones");
      return;
    }

    try {
      setIsLoading(true);
      await onRegister({
        tipo_identificacion: formData.tipo_identificacion,
        numero_identificacion: formData.numero_identificacion,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        email: formData.email,
        telefono_celular: formData.telefono_celular,
        password: formData.password,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo completar el registro";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: Provider) => {
    setError("");
    setIsLoading(true);

    try {
      await onLoginWithProvider(provider);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo continuar con proveedor externo";
      setError(message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center overflow-y-auto px-4 py-8">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      
        <div className="max-h-[90vh] overflow-y-auto p-2 sm:p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="h-2 bg-gradient-to-r from-forest via-forest-light to-forest" />

            <div className="p-5 sm:p-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={24} />
              </button>

              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/20">
                  <UserPlus className="h-7 w-7 text-forest" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Crear Cuenta
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Unete a la comunidad Makakaw
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialRegister("google")}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GoogleIcon />
                    Registrarse con Google
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    o
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Tipo de Identificacion
                  </label>
                  <select
                    name="tipo_identificacion"
                    value={formData.tipo_identificacion}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/20"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CC">Cedula de Ciudadania</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cedula de Extranjeria</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Numero de Identificacion
                  </label>
                  <input
                    type="tel"
                    name="numero_identificacion"
                    value={formData.numero_identificacion}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="1234567890"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Primer Nombre
                  </label>
                  <input
                    type="text"
                    name="primer_nombre"
                    value={formData.primer_nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Segundo Nombre
                  </label>
                  <input
                    type="text"
                    name="segundo_nombre"
                    value={formData.segundo_nombre}
                    onChange={handleChange}
                    placeholder="Andres"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Primer Apellido
                  </label>
                  <input
                    type="text"
                    name="primer_apellido"
                    value={formData.primer_apellido}
                    onChange={handleChange}
                    placeholder="Perez"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    name="segundo_apellido"
                    value={formData.segundo_apellido}
                    onChange={handleChange}
                    placeholder="Lopez"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Correo Electronico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    name="telefono_celular"
                    value={formData.telefono_celular}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="+57 300 123 4567"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Contrasena
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="********"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 text-xs transition-colors",
                          req.met ? "text-forest" : "text-muted-foreground",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full transition-all",
                            req.met ? "bg-forest" : "bg-muted",
                          )}
                        >
                          {req.met && (
                            <Check size={10} className="text-white" />
                          )}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Confirmar Contrasena
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="********"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAcceptTerms(!acceptTerms)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                      acceptTerms
                        ? "border-forest bg-forest"
                        : "border-border hover:border-forest",
                    )}
                  >
                    {acceptTerms && <Check size={12} className="text-white" />}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Acepto los{" "}
                    <a href="#" className="text-forest hover:underline">
                      terminos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" className="text-forest hover:underline">
                      politica de privacidad
                    </a>
                  </span>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-4 font-semibold text-white transition-all duration-300 hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Crear Cuenta
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Ya tienes una cuenta?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-semibold text-forest transition-colors hover:text-forest-light"
                  >
                    Inicia sesion aqui
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.2H12z" />
      <path fill="#34A853" d="M3.5 7.4l3.2 2.3C7.5 7.7 9.6 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.7 0-7 2.1-8.5 5z" />
      <path fill="#FBBC05" d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.3-2.6-5.5-3.9l-3.2 2.5c1.5 2.9 4.6 5.1 8.7 5.1z" />
      <path fill="#4285F4" d="M21.1 12.3c0-.5 0-.9-.1-1.2H12v3.9h5.5c-.3 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6 0-1 .2-1.9.7-2.7L3.5 7.4C2.8 8.8 2.4 10.4 2.4 12c0 5.3 4.3 9.6 9.6 9.6 6.9 0 9.1-4.8 9.1-9.3z" />
    </svg>
  );
}

