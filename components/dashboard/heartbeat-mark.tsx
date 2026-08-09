import { HeartPulse } from "lucide-react";

export function HeartbeatMark({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ${
        large ? "size-20 rounded-[1.5rem]" : "size-11"
      }`}
    >
      <HeartPulse className={large ? "size-10 animate-heartbeat" : "size-6"} />
    </div>
  );
}
