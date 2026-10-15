"use client";

import { useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { cx } from "@/components/ui/icon-glyph-styles";
import { projectStages } from "./slides";

gsap.registerPlugin(useGSAP);

/**
 * Inputs sin caja: solo el placeholder en gris y una línea casi invisible
 * abajo. La línea no es decorativa — sin ninguna pista visual el campo no se
 * lee como campo. Al enfocar pasa a color de marca, que es el único estado
 * visible y hace de indicador de foco accesible.
 */
const FIELD =
  "w-full border-b border-foreground/10 bg-transparent py-3 font-neue text-base text-foreground placeholder:text-foreground/35 transition-colors focus:border-brand focus:outline-none";

type FormState = {
  nombre: string;
  email: string;
  empresa: string;
  proyecto: string;
  etapa: string;
};

const EMPTY: FormState = {
  nombre: "",
  email: "",
  empresa: "",
  proyecto: "",
  etapa: "",
};

export function ContactForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState<FormState>(EMPTY);

  const boxRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof FormState) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  // El paso 1 solo avanza con nombre y un email con pinta de email.
  const canContinue =
    values.nombre.trim().length > 1 && /.+@.+\..+/.test(values.email);

  // Cada cambio de panel entra desde abajo. Al depender de `step` y `sent`,
  // sirve igual para los dos pasos y para la pantalla de confirmación.
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      gsap.from(paneRef.current, {
        y: 16,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: boxRef, dependencies: [step, sent] },
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // PENDIENTE: no hay backend. Aquí va el POST al endpoint o al servicio de
    // formularios; de momento solo pasa a la pantalla de confirmación.
    setSent(true);
  };

  return (
    <div
      ref={boxRef}
      // El ancho lo fija el contenedor de la sección; aquí solo el tope y el
      // alto mínimo, para que la caja no dé un salto al cambiar de paso.
      className="flex w-full max-w-[560px] flex-col rounded-2xl bg-white p-7 shadow-[0_10px_50px_rgba(0,0,0,0.12)] sm:min-h-[500px] sm:p-10"
    >
      {/* Badge de paso, arriba a la izquierda. */}
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-lg bg-foreground/5 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-foreground/50 uppercase">
          {sent ? "Enviado" : `Paso ${step} de 2`}
        </span>

        {/* Barra de progreso: dos tramos, uno por paso. */}
        <span aria-hidden className="flex gap-1.5">
          {[1, 2].map((i) => (
            <span
              key={i}
              className={cx(
                "h-1 w-6 rounded-full transition-colors duration-500",
                sent || step >= i ? "bg-brand" : "bg-foreground/15",
              )}
            />
          ))}
        </span>
      </div>

      {sent ? (
        <div
          ref={paneRef}
          className="flex flex-1 flex-col items-start justify-center gap-4"
        >
          <IconBadge icon={Check} size="lg" />
          <p className="font-neue-bold text-2xl leading-tight tracking-tight">
            Gracias, {values.nombre.split(" ")[0]}.
          </p>
          <p className="font-neue text-base leading-relaxed text-foreground/60">
            Te escribimos en menos de 24 horas para agendar la llamada.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-1 flex-col">
          <h3 className="mt-6 font-neue-bold text-2xl leading-[1.1] tracking-tight text-balance">
            Habla con un experto,
            <br />
            no con un vendedor.
          </h3>

          <div ref={paneRef} className="mt-7 flex flex-1 flex-col gap-1">
            {step === 1 ? (
              <>
                <label className="sr-only" htmlFor="nombre">
                  Tu nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  className={FIELD}
                  value={values.nombre}
                  onChange={(e) => set("nombre")(e.target.value)}
                />

                <label className="sr-only" htmlFor="email">
                  Tu correo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Tu correo"
                  className={FIELD}
                  value={values.email}
                  onChange={(e) => set("email")(e.target.value)}
                />

                <label className="sr-only" htmlFor="empresa">
                  Tu empresa (opcional)
                </label>
                <input
                  id="empresa"
                  name="empresa"
                  autoComplete="organization"
                  placeholder="Tu empresa (opcional)"
                  className={FIELD}
                  value={values.empresa}
                  onChange={(e) => set("empresa")(e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="sr-only" htmlFor="proyecto">
                  Cuéntanos de tu proyecto
                </label>
                <textarea
                  id="proyecto"
                  name="proyecto"
                  rows={5}
                  placeholder="¿Qué problema quieres resolver?"
                  className={cx(FIELD, "resize-none")}
                  value={values.proyecto}
                  onChange={(e) => set("proyecto")(e.target.value)}
                />

                <fieldset className="mt-6">
                  <legend className="text-[11px] font-bold tracking-[0.14em] text-foreground/40 uppercase">
                    ¿En qué etapa estás?
                  </legend>
                  {/* Chips en vez de otro campo de texto: la respuesta útil
                      son tres opciones, no un párrafo. */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {projectStages.map((stage) => {
                      const active = values.etapa === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          aria-pressed={active}
                          onClick={() => set("etapa")(active ? "" : stage)}
                          className={cx(
                            "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                            active
                              ? "border-brand bg-brand text-white"
                              : "border-foreground/10 bg-foreground/[0.03] text-foreground/70 hover:border-foreground/25",
                          )}
                        >
                          {stage}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </>
            )}
          </div>

          {/* Acciones, ancladas al pie de la caja. */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex cursor-pointer items-center gap-2 font-neue text-small text-foreground/50 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Atrás
              </button>
            ) : (
              <span />
            )}

            <button
              type={step === 1 ? "button" : "submit"}
              onClick={step === 1 ? () => setStep(2) : undefined}
              disabled={step === 1 && !canContinue}
              data-sound
              className="flex cursor-pointer items-center gap-3 rounded-2xl bg-foreground py-2 pr-2 pl-5 text-background transition-all duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100"
            >
              <span className="font-neue text-small">
                {step === 1 ? "Continuar" : "Enviar"}
              </span>
              <IconBadge icon={ArrowUpRight} size="md" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
