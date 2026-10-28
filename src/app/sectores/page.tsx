import type { Metadata } from "next";
import { Sectors } from "@/components/sections/sectors";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Sectores | Bloxtek",
  description:
    "No aplicamos la misma receta a todos los sectores. Legal y notarías, educación, inmobiliario y fintech: el problema, el riesgo no visible y la solución de cada industria.",
};

export default function SectoresPage() {
  return (
    <>
      <div className="relative">
        <div className="relative z-10 bg-background">
          <Sectors />
        </div>
        <Footer />
      </div>
    </>
  );
}
