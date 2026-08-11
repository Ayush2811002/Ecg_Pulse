"use client";
// import { useRef } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EcgChartComponent from "@/components/EcgChartComponent";
import { connectArduino, disconnectArduino } from "@/lib/serial";
import { ECGRecorder } from "@/lib/ecgRecorder";
import { downloadECGCSV, downloadECGPDF } from "@/lib/ecgExport";
import {
  Activity,
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MonitorDot,
  MoreHorizontal,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { ECGProcessor } from "@/lib/ecgProcessor";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SplashScreen } from "@/components/dashboard/splash-screen";
import { LoginScreen } from "@/components/dashboard/login-screen";
import { EmptyDeviceState } from "@/components/dashboard/empty-device-state";
import { HeartbeatMark } from "@/components/dashboard/heartbeat-mark";
import { EcgLine } from "@/components/dashboard/ecg-line";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Live ECG", icon: MonitorDot },
  { label: "Reports", icon: FileText },
  { label: "My health", icon: Users },
  { label: "Settings", icon: Settings },
];

const reports = [
  {
    date: "Today, 09:42 AM",
    type: "Home ECG",
    result: "Saved",
    tone: "normal",
  },
  {
    date: "Today, 08:15 AM",
    type: "Rhythm check",
    result: "Shared",
    tone: "reviewed",
  },
  {
    date: "Yesterday, 04:36 PM",
    type: "Home ECG",
    result: "Saved",
    tone: "normal",
  },
];

export function EcgDashboard() {
  const [screen, setScreen] = useState<"splash" | "login" | "dashboard">(
    "splash",
  );
  const [user, setUser] = useState<User | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [running, setRunning] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [ecgData, setEcgData] = useState<number[]>([]);
  const processor = useRef(new ECGProcessor());
  const recorder = useRef(new ECGRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"info" | "success" | "danger">(
    "info",
  );
  const [showEcgInstructions, setShowEcgInstructions] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setScreen("dashboard");
      } else {
        setScreen("login");
      }
    });

    const timer = window.setTimeout(() => {
      if (screen === "splash") {
        setScreen("login");
      }
    }, 2600);

    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [screen]);
  const showNotice = (
    text: string,
    type: "info" | "success" | "danger" = "info",
  ) => {
    setNotice(text);
    setNoticeType(type);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const handleDeviceDisconnect = async () => {
    setDeviceConnected(false);
    setRunning(false);
    setIsRecording(false);

    try {
      await disconnectArduino();
    } catch (err) {
      console.error("Error closing serial after disconnect:", err);
    }

    showNotice(
      "Device disconnected unexpectedly. Please reconnect your monitor.",
      "danger",
    );
  };
  const connectDevice = async () => {
    try {
      setConnecting(true);

      // await connectArduino((data: string) => {
      //   const value = Number(data);

      //   if (!isNaN(value)) {
      //     setEcgData((prev) => {
      //       const updated = [...prev, value];

      //       if (updated.length > 500) {
      //         updated.shift();
      //       }

      //       return updated;
      //     });
      //   }
      // });

      // await connectArduino((data: string) => {
      //   try {
      //     console.log("Serial raw:", data);

      //     // Accept multiple numeric values per line and ignore non-numeric text
      //     const matches = data.match(/-?\d+(?:\.\d+)?/g);

      //     if (!matches) return;

      //     const nums = matches.map((m) => Number(m));

      //     setEcgData((prev) => {
      //       const updated = [...prev, ...nums];

      //       while (updated.length > 500) {
      //         updated.shift();
      //       }

      //       console.log("Points:", updated.length);

      //       return updated;
      //     });

      //     console.log("Parsed numbers:", nums);
      //   } catch (err) {
      //     console.error("Error parsing serial data:", err);
      //   }
      // });

      // await connectArduino((data: string) => {
      //   try {
      //     const matches = data.match(/-?\d+(?:\.\d+)?/g);

      //     if (!matches) return;

      //     const nums = matches.map(Number);

      //     setEcgData(() => {
      //       nums.forEach((value) => {
      //         processor.current.addSample(value);
      //       });
      //       setHeartRate(processor.current.getHeartRate());

      //       return processor.current.getFilteredSamples();
      //     });
      //   } catch (err) {
      //     console.error(err);
      //   }
      // }, handleDeviceDisconnect);

      await connectArduino((data: string) => {
        try {
          const lines = data.split(/\r?\n/);
          const sensorPoints: Array<{
            timestamp: number;
            adcValue: number;
            voltage: number;
          }> = [];

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const parts = trimmed.split(",");
            if (parts.length !== 3) continue;

            const timestamp = Number(parts[0]);
            const adcValue = Number(parts[1]);
            const voltage = Number(parts[2]);

            if (
              Number.isNaN(timestamp) ||
              Number.isNaN(adcValue) ||
              Number.isNaN(voltage)
            ) {
              console.warn("Invalid sensor line:", trimmed);
              continue;
            }

            sensorPoints.push({ timestamp, adcValue, voltage });
            processor.current.addSample(voltage);
            recorder.current.addSample(voltage);
          }

          if (sensorPoints.length > 0) {
            const lastPoint = sensorPoints[sensorPoints.length - 1];
            console.log("Sensor values chunk:", {
              count: sensorPoints.length,
              lastPoint,
            });
          }

          setHeartRate(processor.current.getHeartRate());
          setEcgData(processor.current.getFilteredSamples());
        } catch (err) {
          console.error("ECG processing error:", err);
        }
      }, handleDeviceDisconnect);

      setDeviceConnected(true);

      showNotice("ECG Device Connected", "success");
    } catch (err) {
      console.error(err);

      showNotice("Failed to connect ECG Device", "danger");
    } finally {
      setConnecting(false);
    }
  };

  const startRecording = () => {
    if (!deviceConnected) {
      showNotice("Please connect your ECG device first.", "danger");
      return;
    }

    if (recorder.current.isRecording()) {
      return;
    }

    recorder.current.start();

    setIsRecording(true);
    setRecordingSeconds(0);
    setRunning(true);

    showNotice(
      "ECG recording started. Stay still and breathe normally.",
      "success",
    );

    const startTime = Date.now();

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      setRecordingSeconds(elapsed);

      if (elapsed >= 60) {
        window.clearInterval(timer);

        finishRecording();
      }
    }, 250);
  };
  // ADD THIS
  const finishRecording = () => {
    const samples = recorder.current.stop();

    setIsRecording(false);
    setRunning(false);
    setRecordingSeconds(60);

    if (samples.length === 0) {
      showNotice("No ECG data was recorded.", "danger");
      return;
    }

    // Download CSV
    downloadECGCSV(samples);

    showNotice(
      `ECG recording complete. ${samples.length} samples saved.`,
      "success",
    );
  };
  const refreshDevice = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      showNotice(
        deviceConnected
          ? "Device connection is up to date."
          : "No device found nearby.",
      );
    }, 800);
  };
  const chooseNav = (label: string) => {
    setActiveNav(label);
    setMobileNavOpen(false);
    showNotice(`${label} selected`);
  };

  if (screen === "splash") return <SplashScreen />;
  if (screen === "login")
    return <LoginScreen onLogin={() => setScreen("dashboard")} />;

  const isHome = activeNav === "Dashboard" || activeNav === "Live ECG";
  const rawName = user?.displayName || user?.email?.split("@")[0] || "there";
  const firstName = rawName.split(" ")[0];
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <HeartbeatMark />
            <div>
              <p className="font-semibold tracking-tight">PulseView</p>
              <p className="text-xs text-muted-foreground">
                Your heart, at home
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>
        <Separator className="my-6" />
        <nav
          aria-label="Primary navigation"
          className="flex flex-1 flex-col gap-1"
        >
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            My space
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => chooseNav(item.label)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeNav === item.label ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
              >
                <Icon className="size-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="rounded-2xl bg-sidebar-accent/70 p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-card text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-sm font-semibold">Your readings are private</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Your health data is encrypted and only shared with people you
            choose.
          </p>
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-primary hover:underline"
            onClick={() =>
              showNotice("Your health readings are encrypted and private.")
            }
          >
            Learn about privacy
          </button>
        </div>
        <Separator className="my-5" />
        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.displayName
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase() ||
                user?.email?.slice(0, 2).toUpperCase() ||
                "ME"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user?.displayName || user?.email || "Your profile"}
            </p>
            <p className="truncate text-xs text-muted-foreground">My profile</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={async () => {
              await signOut(auth);
              showNotice("You have been signed out.");
            }}
          >
            <LogOut />
          </Button>
        </div>
        <Link
          href="/profile"
          className="mt-3 block rounded-xl border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          View profile
        </Link>
      </aside>
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="min-h-screen lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-border bg-card/80 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu />
            </Button>
            <div>
              <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                My space / {activeNav}
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {activeNav === "Dashboard"
                  ? `${greeting}, ${firstName}`
                  : activeNav}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => showNotice("You have no new notifications.")}
            >
              <Bell />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden gap-2 sm:flex"
              onClick={() =>
                showNotice("Help is available from your care team.")
              }
            >
              <CircleHelp data-icon="inline-start" />
              Help center
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Ready for a reading
                </span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your heart health, at a glance.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Take a quick ECG from home and keep your care team informed.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-fit gap-2 bg-card"
              onClick={() => setShowEcgInstructions((prev) => !prev)}
            >
              <CircleHelp data-icon="inline-start" />
              {showEcgInstructions ? "Hide ECG guide" : "How to take an ECG"}
            </Button>
          </div>
          {notice && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
                noticeType === "danger"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : noticeType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-primary/20 bg-primary/10 text-primary"
              }`}
              role="status"
            >
              {notice}
            </div>
          )}

          {showEcgInstructions && (
            <>
              <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" />
              <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
                <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-border bg-background shadow-2xl ring-1 ring-slate-900/10">
                  <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        How to take an ECG
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Follow these instructions to prepare, place leads,
                        record, and avoid common issues.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEcgInstructions(false)}
                    >
                      Close
                    </Button>
                  </div>

                  <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                      <section className="space-y-3 rounded-3xl border border-border bg-muted/60 p-5">
                        <h3 className="text-sm font-semibold">
                          1. Before starting
                        </h3>
                        <ul className="space-y-2 text-sm leading-6 text-muted-foreground list-disc list-inside">
                          <li>Sit quietly for 5 minutes before recording.</li>
                          <li>
                            Avoid talking or moving during the ECG recording.
                          </li>
                          <li>
                            Keep hands and skin dry before attaching electrodes.
                          </li>
                          <li>
                            Remove excessive clothing around the chest area.
                          </li>
                          <li>
                            Do not take the ECG immediately after exercise.
                          </li>
                        </ul>
                      </section>

                      <section className="space-y-3 rounded-3xl border border-border bg-muted/60 p-5">
                        <h3 className="text-sm font-semibold">
                          2. Taking the ECG
                        </h3>
                        <ul className="space-y-2 text-sm leading-6 text-muted-foreground list-disc list-inside">
                          <li>
                            Connect all leads firmly to the monitor and
                            electrodes.
                          </li>
                          <li>
                            Place the monitor correctly on your chest before
                            starting.
                          </li>
                          <li>
                            Stay still and relaxed while the device is
                            recording.
                          </li>
                          <li>Start recording using the Start ECG button.</li>
                          <li>
                            Wait until the required recording duration is
                            complete before stopping.
                          </li>
                        </ul>
                      </section>

                      <section className="space-y-3 rounded-3xl border border-border bg-muted/60 p-5">
                        <h3 className="text-sm font-semibold">
                          3. Common problems
                        </h3>
                        <ul className="space-y-2 text-sm leading-6 text-muted-foreground list-disc list-inside">
                          <li>
                            <strong>Poor signal / noisy ECG</strong> — stay
                            still and relax your muscles.
                          </li>
                          <li>
                            <strong>Lead off</strong> — check that each
                            electrode has good skin contact.
                          </li>
                          <li>
                            <strong>Flat or zero waveform</strong> — verify all
                            lead connections.
                          </li>
                          <li>
                            <strong>Baseline moving</strong> — avoid movement
                            and keep cables secure.
                          </li>
                          <li>
                            <strong>Interference</strong> — move away from
                            chargers or electrical equipment.
                          </li>
                          <li>
                            <strong>Dry skin</strong> — clean or wipe the skin
                            and reattach the electrode.
                          </li>
                          <li>
                            Excessive hair may prevent good contact; press
                            electrodes gently for a better seal.
                          </li>
                        </ul>
                      </section>

                      <section className="rounded-3xl border border-border bg-rose-50 p-5">
                        <h3 className="text-sm font-semibold text-rose-700">
                          4. Safety notice
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-rose-700">
                          This device is for ECG recording and monitoring only
                          and does not replace medical diagnosis.
                        </p>
                        <p className="mt-3 text-sm leading-6 text-rose-700">
                          If someone has severe chest pain, severe breathing
                          difficulty, fainting, or other emergency symptoms,
                          seek emergency medical care instead of relying only on
                          this app.
                        </p>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="rounded-3xl border border-border bg-muted/60 p-5">
                        <h3 className="text-sm font-semibold">
                          2. Lead placement
                        </h3>
                        <div className="mt-4 grid gap-4">
                          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-sm font-medium text-slate-900">
                              Lead diagram
                            </div>
                            <div className="relative mx-auto h-[340px] w-full max-w-[320px] rounded-[2.5rem] border border-slate-200 bg-slate-50 px-4 py-6">
                              <div className="absolute left-1/2 top-6 h-12 w-16 -translate-x-1/2 rounded-full border border-slate-300 bg-slate-100" />
                              <div className="absolute left-1/2 top-28 h-20 w-24 -translate-x-1/2 rounded-full border border-slate-300 bg-slate-100" />
                              <div className="absolute left-1/2 top-56 h-10 w-10 -translate-x-1/2 rounded-full border border-slate-300 bg-slate-100" />
                              <div className="absolute left-[60%] top-40 h-10 w-10 rounded-full bg-red-500 shadow-lg" />
                              <div className="absolute left-[35%] top-50 h-10 w-10 rounded-full bg-yellow-400 shadow-lg" />
                              <div className="absolute left-[62%] top-62 h-10 w-10 rounded-full bg-emerald-500 shadow-lg" />
                              <div className="absolute left-[18%] top-34 h-10 w-10 rounded-full bg-red-500 shadow-lg" />
                              <div className="absolute left-[25%] top-62 h-10 w-10 rounded-full bg-yellow-400 shadow-lg" />
                            </div>
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
                              Electrodes should have good skin contact and be
                              placed on clean, dry skin.
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {isHome ? (
            <>
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <EmptyDeviceState
                  deviceConnected={deviceConnected}
                  onConnect={connectDevice}
                  onDisconnect={handleDeviceDisconnect}
                />
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">Device status</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {connecting
                          ? "Searching nearby..."
                          : deviceConnected
                            ? "Connected just now"
                            : "Connect to take a reading"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Refresh device status"
                      onClick={refreshDevice}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <RefreshCw className="animate-spin" />
                      ) : (
                        <RefreshCw />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                      <span
                        className={`flex size-10 items-center justify-center rounded-full ${deviceConnected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}
                      >
                        {deviceConnected ? <Link2 /> : <WifiOff />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {deviceConnected
                            ? "PulseView ECG monitor"
                            : "No device connected"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deviceConnected
                            ? "Ready to record"
                            : "Keep your monitor nearby"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">Live ECG</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {deviceConnected
                          ? "Place your fingers on the sensors"
                          : "Connect your device to see your waveform"}
                      </p>
                    </div>
                    <Badge variant={deviceConnected ? "secondary" : "outline"}>
                      {deviceConnected ? "Ready" : "Waiting"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`relative h-52 overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-4 ${!deviceConnected ? "opacity-60" : ""}`}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49.5%,var(--border)_50%,transparent_50.5%),linear-gradient(to_bottom,transparent_49.5%,var(--border)_50%,transparent_50.5%)] bg-[size:48px_48px] opacity-40" />
                      {deviceConnected ? (
                        <EcgChartComponent
                          data={ecgData}
                          sampleRate={processor.current.getSampleRate()}
                          windowSeconds={10}
                        />
                      ) : (
                        <EcgLine muted />
                      )}
                      <div className="absolute inset-x-0 bottom-3 flex justify-between px-4 text-[10px] text-muted-foreground">
                        <span>0 sec</span>
                        <span>5 sec</span>
                        <span>10 sec</span>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      {/* <Button
                        type="button"
                        className="w-full gap-2 sm:w-auto"
                        disabled={!deviceConnected || running}
                        onClick={() => {
                          setRunning(true);
                          showNotice(
                            "ECG recording started. Stay still and breathe normally.",
                          );
                        }}
                      >
                        <Activity data-icon="inline-start" />
                        {running ? "Recording..." : "Start ECG"}
                      </Button> */}
                      <Button
                        type="button"
                        className="w-full gap-2 sm:w-auto"
                        disabled={!deviceConnected || isRecording}
                        onClick={startRecording}
                      >
                        <Activity data-icon="inline-start" />

                        {isRecording
                          ? `Recording ${recordingSeconds}s / 60s`
                          : "Start ECG"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={!running}
                        onClick={() => {
                          if (recorder.current.isRecording()) {
                            finishRecording();
                          }
                        }}
                      >
                        Stop ECG
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        disabled={recorder.current.getSampleCount() === 0}
                        onClick={() => {
                          if (!recorder.current.isRecording()) {
                            downloadECGPDF(
                              recorder.current.getSamples(),
                              heartRate,
                              processor.current.getSampleRate(),
                              "I",
                              "3-lead ECG acquisition",
                            );
                          }
                        }}
                      >
                        <FileText data-icon="inline-start" />
                        Download ECG PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                          Heart rate
                        </p>
                        <HeartPulse className="text-primary" />
                      </div>
                      <p className="mt-5 text-4xl font-semibold tracking-tight">
                        {deviceConnected ? heartRate : "--"}{" "}
                        <span className="ml-2 text-base font-medium text-muted-foreground">
                          BPM
                        </span>
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {deviceConnected
                          ? "Within your usual range"
                          : "Available after connection"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                          Lead status
                        </p>
                        <span
                          className={`size-2 rounded-full ${deviceConnected ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                      </div>
                      <p className="mt-5 text-xl font-semibold">
                        {deviceConnected ? "Good contact" : "Not connected"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {deviceConnected
                          ? "You are ready to record"
                          : "Connect your monitor first"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>{activeNav}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  This area is ready for your personal health information.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-48 flex-col items-center justify-center rounded-xl bg-muted/40 text-center">
                  <UserRound className="mb-3 text-primary" />
                  <p className="font-semibold">{activeNav} view</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your saved information will appear here.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => chooseNav("Dashboard")}
                  >
                    Back to dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-4 border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Recent reports</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your saved readings and notes from your care team.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="More report options"
                onClick={() => showNotice("Report options are coming soon.")}
              >
                <MoreHorizontal />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={`${report.date}-${report.type}`}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {report.date}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.type}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.result}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              showNotice(
                                `${report.type} from ${report.date} selected.`,
                              )
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            PulseView helps you record heart activity at home. It does not
            replace medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}
