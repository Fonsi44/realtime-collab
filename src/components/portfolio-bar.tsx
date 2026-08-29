import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ECOSYSTEM_APPS,
  PORTFOLIO_URL,
  siblingApps,
} from "@/lib/ecosystem-urls";

export function PortfolioBar() {
  const appId = "collab" as const;
  const appLabel = "Collab";
  const siblings = siblingApps(appId);

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#030306]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={PORTFOLIO_URL}
          className="inline-flex shrink-0 items-center gap-2 font-mono text-xs text-zinc-400 transition hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030306]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          fonsidev.com
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto scrollbar-none md:flex"
          aria-label="Ecosistema FonsiDev"
        >
          {ECOSYSTEM_APPS.filter((a) => a.id !== "hub").map((app) => (
            <a
              key={app.id}
              href={app.url}
              className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10px] transition ${
                app.id === appId
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "text-zinc-600 hover:text-zinc-300"
              }`}
              aria-current={app.id === appId ? "page" : undefined}
            >
              {app.label}
            </a>
          ))}
        </nav>

        <span className="ml-auto shrink-0 font-mono text-sm tracking-widest text-cyan-400">
          {appLabel}
        </span>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-1.5 scrollbar-none md:hidden"
        aria-label="Otros productos"
      >
        {siblings.map((app) => (
          <a
            key={app.id}
            href={app.url}
            className="shrink-0 rounded-md px-2 py-0.5 font-mono text-[9px] text-zinc-600 transition hover:text-cyan-400"
          >
            {app.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
