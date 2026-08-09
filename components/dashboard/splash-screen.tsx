import { HeartbeatMark } from "@/components/dashboard/heartbeat-mark";

export function SplashScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center text-center animate-fade-in">
        <HeartbeatMark large />
        <h1 className="mt-7 text-4xl font-semibold tracking-tight text-foreground">
          Pulse<span className="text-primary">View</span>
        </h1>
        <p className="mt-3 max-w-xs text-pretty text-sm leading-6 text-muted-foreground">
          Your heart health, made simple. Take an ECG from home and stay
          connected to your care.
        </p>
        <div className="mt-12 h-1.5 w-44 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-primary animate-loading-bar" />
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          Preparing your heart health space...
        </p>
      </div>
    </main>
  );
}
