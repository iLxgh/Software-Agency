import { ArrowUpRight, Volume2 } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { IconLink } from "@/components/ui/icon-link";

const navLinks = ["About", "Work", "Services", "Process"];

export function Navbar() {
  return (
    <header className="flex justify-center pt-4 sm:pt-6 text-black">
      <nav className="flex w-full max-w-4xl items-center gap-4 rounded-2xl bg-card px-5 py-3 shadow-sm sm:px-6">
        <a href="#" className="text-xl font-extrabold tracking-tight">
          BLOXTEK
        </a>

        <ul className="mx-auto hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-small font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <IconLink href="#" icon={ArrowUpRight}>
            <span className="hidden sm:inline">Talk to us</span>
          </IconLink>
          <IconButton icon={Volume2} aria-label="Toggle sound" />
        </div>
      </nav>
    </header>
  );
}
