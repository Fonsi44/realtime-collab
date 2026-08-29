import { Suspense } from "react";
import { CollabBoard } from "@/components/collab-board";
import { PortfolioBar } from "@/components/portfolio-bar";

export default function Home() {
  return (
    <>
      <PortfolioBar />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center font-mono text-sm text-zinc-500">
            Cargando sala…
          </div>
        }
      >
        <CollabBoard />
      </Suspense>
    </>
  );
}
