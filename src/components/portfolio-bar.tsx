import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

const PORTFOLIO_URL = "https://portfolio-hub-flax.vercel.app";

export function PortfolioBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b-4 border-dashed border-yellow-400/40 bg-[#5c4a32]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href={PORTFOLIO_URL}
          className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-3 py-1 text-sm font-bold text-[#3d2f1f] shadow-sm transition hover:bg-yellow-200 focus-visible:ring-2 focus-visible:ring-yellow-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Portfolio
        </Link>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-yellow-200">
          <Users className="h-4 w-4" aria-hidden="true" />
          Collab Playground
        </span>
      </div>
    </div>
  );
}
