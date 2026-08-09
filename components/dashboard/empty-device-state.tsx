import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Link2 } from "lucide-react";
import { connectArduino } from "@/lib/serial";

export function EmptyDeviceState({
  deviceConnected,
  onConnect,
  onDisconnect,
}: {
  deviceConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //   const handleConnect = async () => {
  //     setError("");
  //     setLoading(true);

  //     try {
  //       await connectArduino((data) => {
  //         console.log("ECG:", data);
  //       });

  //       onConnect();
  //     } catch (error) {
  //       console.error(error);
  //       setError("Failed to connect to ECG device.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const handleConnect = async () => {
    setError("");
    setLoading(true);

    try {
      // Delegate connection to parent so a single handler attaches and feeds the chart
      await Promise.resolve(onConnect());
    } catch (err) {
      console.error(err);
      setError("Failed to connect to ECG device.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="overflow-hidden border-primary/15 bg-card shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Link2 className="size-6" />
            </div>
            <div>
              <Badge
                variant="outline"
                className={`mb-3 ${
                  deviceConnected
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {deviceConnected ? "Device connected" : "No device connected"}
              </Badge>
              <h3 className="text-2xl font-semibold tracking-tight">
                {deviceConnected
                  ? "ECG Device Connected"
                  : "Connect your ECG device"}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {deviceConnected
                  ? "Your PulseView ECG monitor is connected and ready for live monitoring."
                  : "Connect your PulseView monitor to start a reading. It only takes a moment, and we'll guide you through each step."}
              </p>
            </div>
          </div>
          <Button
            className="h-11 w-full shrink-0 gap-2 sm:w-auto"
            onClick={handleConnect}
            disabled={loading || deviceConnected}
          >
            {deviceConnected
              ? "Device connected"
              : loading
                ? "Connecting..."
                : "Connect device"}
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="mt-7 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              1
            </span>
            <span className="text-sm text-muted-foreground">
              Turn on your monitor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              2
            </span>
            <span className="text-sm text-muted-foreground">
              Keep it nearby
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              3
            </span>
            <span className="text-sm text-muted-foreground">
              Follow the placement guide
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
