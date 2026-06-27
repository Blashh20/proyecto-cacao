import { Empresa } from "@/model/empresa";
import { useState, FormEvent, ReactNode } from "react";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-focus-within:text-forest">
        {label}
      </label>
      {children}
    </div>
  );
}

export function PanelEmpresa(){
    const [form , setForm] = useState<Empresa>()

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        throw new Error("Function not implemented.");
    }

    return (<>
        <form onSubmit={handleSubmit}>
            <Field
                label="hola"
            >
                <textarea
                    required
                    rows={5}
                    className={`resize-none`}
                />
            </Field>
        </form>
    
    </>)
}