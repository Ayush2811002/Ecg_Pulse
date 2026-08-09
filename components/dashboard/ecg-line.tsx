export function EcgLine({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 800 160"
      preserveAspectRatio="none"
      role="img"
      aria-label="ECG waveform"
    >
      <path
        d="M0 80 H95 L104 80 L111 38 L118 122 L125 80 H205 L214 80 L221 54 L228 106 L235 80 H315 L324 80 L331 38 L338 122 L345 80 H425 L434 80 L441 54 L448 106 L455 80 H535 L544 80 L551 38 L558 122 L565 80 H645 L654 80 L661 54 L668 106 L675 80 H800"
        fill="none"
        stroke={muted ? "var(--muted-foreground)" : "var(--primary)"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        className={!muted ? "animate-waveform" : ""}
      />
    </svg>
  );
}
