import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EcgInstructionsModalProps {
  open: boolean;
  onClose: () => void;
}

export function EcgInstructionsModal({
  open,
  onClose,
}: EcgInstructionsModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-border bg-background shadow-2xl ring-1 ring-slate-900/10">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">How to take an ECG</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Follow these steps to prepare, place leads, record your ECG, and
                avoid common issues.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <section className="space-y-3 rounded-3xl border border-border bg-muted/60 p-5">
                <h3 className="text-sm font-semibold">1. Before starting</h3>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground list-disc list-inside">
                  <li>Sit quietly for 5 minutes before recording.</li>
                  <li>Avoid talking or moving during the ECG recording.</li>
                  <li>Keep hands and skin dry before attaching electrodes.</li>
                  <li>Remove excessive clothing around the chest area.</li>
                  <li>Do not take the ECG immediately after exercise.</li>
                </ul>
              </section>

              <section className="space-y-3 rounded-3xl border border-border bg-muted/60 p-5">
                <h3 className="text-sm font-semibold">2. Taking the ECG</h3>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground list-disc list-inside">
                  <li>
                    Connect all leads firmly to the monitor and electrodes.
                  </li>
                  <li>
                    Place the monitor correctly on your chest before starting.
                  </li>
                  <li>Stay still and relaxed while the device is recording.</li>
                  <li>Start recording using the Start ECG button.</li>
                  <li>
                    Wait until the required recording duration is complete
                    before stopping.
                  </li>
                </ul>
              </section>

              <section className="space-y-3 rounded-3xl border border-border bg-muted/60 p-5">
                <h3 className="text-sm font-semibold">3. Common problems</h3>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground list-disc list-inside">
                  <li>
                    <strong>Poor signal / noisy ECG</strong> — stay still and
                    relax your muscles.
                  </li>
                  <li>
                    <strong>Lead off</strong> — check that each electrode has
                    good skin contact.
                  </li>
                  <li>
                    <strong>Flat or zero waveform</strong> — verify all lead
                    connections.
                  </li>
                  <li>
                    <strong>Baseline moving</strong> — avoid movement and keep
                    cables secure.
                  </li>
                  <li>
                    <strong>Interference</strong> — move away from chargers or
                    electrical equipment.
                  </li>
                  <li>
                    <strong>Dry skin</strong> — clean or wipe the skin and
                    reattach the electrode.
                  </li>
                  <li>
                    Excessive hair may prevent good contact; press electrodes
                    gently for a better seal.
                  </li>
                </ul>
              </section>

              <section className="rounded-3xl border border-border bg-rose-50 p-5">
                <h3 className="text-sm font-semibold text-rose-700">
                  4. Safety notice
                </h3>
                <p className="mt-3 text-sm leading-6 text-rose-700">
                  This device is for ECG recording and monitoring only and does
                  not replace medical diagnosis.
                </p>
                <p className="mt-3 text-sm leading-6 text-rose-700">
                  If someone has severe chest pain, severe breathing difficulty,
                  fainting, or other emergency symptoms, seek emergency medical
                  care instead of relying only on this app.
                </p>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-muted/60 p-5">
                <h3 className="text-sm font-semibold">2. Lead placement</h3>
                <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-medium text-slate-900">
                    Lead diagram
                  </div>
                  <img
                    src="/ecg/lead-placement.svg"
                    alt="Lead placement diagram showing red, yellow, and green electrodes"
                    className="mt-4 h-[340px] w-full object-contain"
                  />
                </div>

                <div className="space-y-3 rounded-3xl border border-border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Red</span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Right upper chest lead.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span>Yellow</span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Left upper chest lead.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Green</span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Lower left ground / reference lead.
                  </p>
                  <p className="pt-3 text-xs leading-5 text-muted-foreground">
                    Electrodes should have good skin contact and be placed on
                    clean, dry skin.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
