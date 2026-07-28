"use client";

import { useEffect } from "react";
import { Sparkle } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { useAboutOpen, closeAbout } from "@/lib/about-panel";
import { lockScroll, unlockScroll } from "@/lib/scroll-to";

const intro = [
  "Hey, we are Bloxtek. We started because we saw how many companies and governments in Mexico invested in blockchain technology but ended up with complex solutions that did not solve their real problems.",
  "That gap became our obsession. We have spent years understanding critical operations to build proprietary platforms that generate trust, traceability and real efficiency.",
  "When we work with our clients, we immerse ourselves in their processes, are relentless in what really matters, and close the gap between their current operation and the digital future they need.",
];

const meta = ["SINCE 2020", "BASED IN MEXICO, NUEVO LEON"];

const clients = [
  "Vinamilk",
  "Moc Chau Creamery",
  "OH Architecture",
  "Supersolid",
  "University of Sydney",
];

const projects = [
  "Awwwards SOTD (x5)",
  "FWA SOTD (x5)",
  "CSSDA SOTD (x5)",
  "Awwwards Honorable Mention (x8)",
];

const principles = [
  {
    title: "Outcomes first, taste second",
    body: "Every creative decision we make is interrogated against one question: does this actually serve your growth?",
  },
  {
    title: "All in or nothing",
    body: "We take on fewer projects so we can give each one everything. When we commit to your brand, we're fully present.",
  },
  {
    title: "Human-first, always",
    body: "Behind every brand is a person with a real story and real stakes. We never lose sight of that.",
  },
];

/** Estrella morada reutilizable (mismo sistema de íconos del proyecto). */
function Star() {
  return (
    <IconBadge
      icon={Sparkle}
      size="sm"
      variant="brand"
      className="mt-0.5 shrink-0 text-white"
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
        aria-label="About the studio"
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
                About the studio
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

          {/* Imagen (placeholder) */}
          <div className="mb-12 flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]">
            <p className="font-mono text-sm text-white/40">
              [ Imagen: Where clarity meets creativity ]
            </p>
          </div>

          {/* Listas */}
          <div className="flex flex-col">
            <Row title="Clients">
              <ul className="flex flex-col gap-1 text-body text-white">
                {clients.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Row>

            <Row title="Projects">
              <ul className="flex flex-col gap-1 text-body text-white">
                {projects.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Row>

            <Row title="Our Principles">
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
