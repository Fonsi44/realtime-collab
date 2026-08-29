export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#030306]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.8) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="ambient-orb absolute -left-32 top-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/8 blur-[120px]" />
      <div className="ambient-orb ambient-orb--slow absolute -right-32 top-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[100px]" />
      <div className="ambient-glow absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[80px]" />
    </div>
  );
}
