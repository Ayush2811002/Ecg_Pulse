"use client";

import { type FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";
import { HeartbeatMark } from "@/components/dashboard/heartbeat-mark";
import { EcgLine } from "@/components/dashboard/ecg-line";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password || (mode === "register" && !name)) {
      setMessage(
        mode === "register"
          ? "Enter your name, email, and password."
          : "Enter your email and password.",
      );
      return;
    }

    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      onLogin();
    } catch (error: any) {
      switch (error.code) {
        case "auth/invalid-credential":
          setMessage("Invalid email or password. Please try again.");
          break;

        case "auth/user-not-found":
          setMessage("No account found with this email.");
          break;

        case "auth/wrong-password":
          setMessage("Incorrect password.");
          break;

        case "auth/invalid-email":
          setMessage("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setMessage("Use a stronger password with at least 6 characters.");
          break;

        case "auth/email-already-in-use":
          setMessage("An account already exists with this email.");
          break;

        case "auth/too-many-requests":
          setMessage("Too many failed attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          setMessage("No internet connection. Please check your network.");
          break;

        default:
          setMessage(
            mode === "register"
              ? "Unable to create account. Please try again."
              : "Unable to sign in. Please try again.",
          );
      }
    }
  };

  return (
    <main className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-primary/5 sm:min-h-[calc(100vh-3rem)]">
        <section className="relative hidden w-1/2 overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <HeartbeatMark />
              <span className="text-xl font-semibold tracking-tight">
                PulseView
              </span>
            </div>
            <div className="mt-24 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
                Feel informed. Feel connected.
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">
                A clearer view of your heart.
              </h1>
              <p className="mt-6 text-base leading-7 text-primary-foreground/75">
                Record your heart rhythm at home, understand your readings, and
                share them with your care team when you need to.
              </p>
            </div>
          </div>
          <div className="relative rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-primary-foreground/70">
                Your heart rhythm
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span className="size-2 rounded-full bg-emerald-300" />
                Calm &amp; steady
              </span>
            </div>
            <div className="h-24">
              <EcgLine />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold">72</span>
              <span className="mb-1 text-sm text-primary-foreground/65">
                BPM
              </span>
            </div>
          </div>
        </section>
        <section className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div className="flex items-center gap-3 lg:hidden">
            <HeartbeatMark />
            <span className="text-xl font-semibold tracking-tight">
              Pulse<span className="text-primary">View</span>
            </span>
          </div>
          <div className="mx-auto w-full max-w-md pt-10 lg:pt-16">
            <p className="text-sm font-semibold text-primary">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Sign in to PulseView
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {mode === "register"
                ? "Create a PulseView account to track your ECG readings from home."
                : "Check your heart rhythm from home and keep your care team in the loop."}
            </p>
            <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() =>
                      setMessage(
                        "Password reset instructions will be sent to your email.",
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pr-11"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground"
                >
                  Remember me
                </Label>
              </div>
              {message && (
                <p
                  className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                  role="status"
                >
                  {message}
                </p>
              )}
              <Button type="submit" className="h-11 w-full">
                {mode === "register" ? "Create account" : "Sign in"}
              </Button>
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={loginWithGoogle}
              >
                Continue with Google
              </Button>
            </form>
            <div className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "register" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to PulseView?{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() => setMode("register")}
                  >
                    Create account
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="pt-8 text-center text-xs leading-5 text-muted-foreground">
            By signing in, you agree to our{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() =>
                setMessage("PulseView terms are available from your care team.")
              }
            >
              Terms of use
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() =>
                setMessage("Your health readings are private and encrypted.")
              }
            >
              Privacy policy
            </button>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
