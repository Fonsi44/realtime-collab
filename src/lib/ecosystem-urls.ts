/** Canonical fonsidev.com URLs — keep in sync with portfolio-hub/src/lib/domains.ts */
export const PORTFOLIO_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "https://fonsidev.com";

export type EcosystemAppId =
  | "hub"
  | "documind"
  | "revops"
  | "pulse"
  | "collab"
  | "flowforge"
  | "signaldesk"
  | "modeltrace";

export type EcosystemApp = {
  id: EcosystemAppId;
  label: string;
  url: string;
};

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  { id: "hub", label: "Hub", url: PORTFOLIO_URL },
  { id: "documind", label: "DocuMind", url: "https://documind.fonsidev.com" },
  { id: "revops", label: "RevOps", url: "https://revops.fonsidev.com" },
  { id: "pulse", label: "Pulse", url: "https://pulse.fonsidev.com" },
  { id: "collab", label: "Collab", url: "https://collab.fonsidev.com" },
  { id: "flowforge", label: "FlowForge", url: "https://flowforge.fonsidev.com" },
  { id: "signaldesk", label: "SignalDesk", url: "https://signaldesk.fonsidev.com" },
  { id: "modeltrace", label: "ModelTrace", url: "https://modeltrace.fonsidev.com" },
];

export function siblingApps(currentId: EcosystemAppId): EcosystemApp[] {
  return ECOSYSTEM_APPS.filter((app) => app.id !== currentId && app.id !== "hub");
}
