"use client";

import { useEffect } from "react";
import { Sparkle } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { useAboutOpen, closeAbout } from "@/lib/about-panel";
import { lockScroll, unlockScroll } from "@/lib/scroll-to";

/**
 * Contenido del panel, sacado de la página "Nosotros" de bloxtek.com.
 *
 * Sustituye a los datos de la plantilla, que listaban como clientes de Bloxtek
 * a Vinamilk, OH Architecture o la University of Sydney, y como premios varios
 * Awwwards y FWA. Son empresas y galardones reales de OTRA agencia: estaban
 * ahí como relleno y publicarlos habría sido atribuirse credenciales ajenas.
 *
 * OJO con lo que NO hay. Su web no publica clientes, ni premios, ni año de
 * fundación, ni nombres del equipo, así que esos bloques no se han "rellenado
 * con otra cosa": se han sustituido por lo único verificable que sí publican
 * —las plataformas propias y los estándares sobre los que construyen—. Si
 * alguien de Bloxtek aporta clientes o cifras reales, este es el sitio.
 */
const intro = [
  "Somos un socio tecnológico, no una fábrica de software. Construimos a partir de problemas reales de negocio, no de la tecnología que esté de moda.",
  "Diagnosticamos la operación antes de proponer nada, y de ahí sale el camino: una plataforma propia, desarrollo a medida o ambos. A veces, la respuesta es que todavía no hace falta software.",
  "Nos quedamos hasta que el resultado es real. Trabajamos sobre estándares abiertos y con infraestructura con validez legal en México, porque lo que construimos tiene que sostenerse ante una auditoría, no solo en una demo.",
];

/** Lo único que su web afirma de sí misma como dato. */
const meta = ["MONTERREY, MÉXICO", "NODO EN LACNET"];

/** Las cuatro plataformas propias. */
const platforms = [
  "LegalBlox — contratos con validez legal",
  "EduBlox — credenciales verificables",
  "RealVext — operación inmobiliaria",
  "Wallox — billetera digital",
];

/** Estándares e infraestructura sobre los que construyen. */
const standards = [
  "W3C — credenciales verificables",
  "Hyperledger",
  "DIF — Decentralized Identity Foundation",
  "LACChain / LACNet",
  "NOM-151-SCFI-2016 — conservación de mensajes de datos",
];

/**
 * Los cuatro compromisos, tal como los enuncia su web. Las bajadas las
 * redacté yo a partir del resto de la página — PENDIENTE de validar.
 */
const principles = [
  {
    title: "Generamos confianza",
    body: "Enseñamos cómo funciona antes de pedir que se confíe en ello. Trazabilidad verificable, no promesas.",
  },
  {
    title: "Entregamos resultados",
    body: "El proyecto termina cuando la operación cambia de verdad, no cuando se entrega el código.",
  },
  {
    title: "Somos ágiles y flexibles",
    body: "Nos adaptamos al proceso que ya existe en vez de pedir que la empresa se adapte al software.",
  },
  {
    title: "Traducimos tech a negocio",
    body: "Explicamos en el idioma de quien decide, no en el de quien programa.",
  },
];

/** Estrella morada reutilizable (mismo sistema de íconos del proyecto). */
function Star() {
  return (
    <IconBadge
      icon={Sparkle}
      size="sm"
      variant="brand"
      className="mt-0.5 shrink-0"
    />
  );
}

export function AboutPanel() {
  const open = useAboutOpen();

  // Al abrir: bloquea el scroll de la página y escucha Esc. Al cerrar/desmontar: libera.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAbout();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open]);

  return (
    <>
      {/* Backdrop: capa oscura + blur sobre la landing */}
      <div
        aria-hidden
        onClick={closeAbout}
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-md transition-opacity duration-700 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel (drawer): entra de derecha a izquierda. `data-lenis-prevent` para
          que Lenis no capture el wheel dentro del panel. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sobre Bloxtek"
        data-lenis-prevent
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-[640px] overflow-y-auto rounded-l-2xl bg-[#131313] text-white shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:w-1/2 ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="p-8 md:p-10">
          {/* Cabecera */}
          <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Star />
              <h2 className="font-neue text-lg tracking-wide text-white">
                Sobre Bloxtek
              </h2>
            </div>

            <button
              type="button"
              data-sound
              onClick={closeAbout}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand/85"
            >
              <span className="font-neue">Close</span>
              <span className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                Esc
              </span>
            </button>
          </div>

          {/* Intro */}
          <div className="mb-12 flex flex-col gap-6">
            {intro.map((p, i) => (
              <p key={i} className="text-body leading-relaxed text-white">
                {p}
              </p>
            ))}
          </div>

          {/* Metadatos */}
          <div className="mb-6 flex flex-wrap gap-8 font-mono text-[11px] tracking-widest text-white/40 uppercase md:gap-14">
            {meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          {/* Listas */}
          <div className="flex flex-col">
            <Row title="Plataformas propias">
              <ul className="flex flex-col gap-1 text-body text-white">
                {platforms.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Row>

            <Row title="Sobre qué construimos">
              <ul className="flex flex-col gap-1 text-body text-white">
                {standards.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Row>

            <Row title="Nuestros compromisos">
              <div className="flex flex-col gap-8">
                {principles.map((p) => (
                  <div key={p.title} className="flex flex-col gap-2">
                    <h4 className="font-neue-bold text-sm text-white">
                      {p.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-white/60">
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </Row>
          </div>
        </div>
      </aside>
    </>
  );
}

function Row({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 border-t border-white/10 py-8 md:flex-row md:gap-0">
      <div className="flex w-full items-start gap-3 md:w-2/5">
        <Star />
        <h3 className="mt-0.5 font-neue text-[15px] text-white">{title}</h3>
      </div>
      <div className="w-full md:w-3/5">{children}</div>
    </div>
  );
}
