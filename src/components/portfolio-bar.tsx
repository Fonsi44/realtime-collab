import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PORTFOLIO_URL = "https://portfolio-hub-flax.vercel.app";

export function PortfolioBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#030306]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={PORTFOLIO_URL}
          className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 transition hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030306]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Portfolio
        </Link>
        <span className="font-mono text-sm tracking-widest text-cyan-400">Collab Board</span>
      </div>
    </div>
  );
}
