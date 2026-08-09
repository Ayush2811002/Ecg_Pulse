"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User, updateProfile } from "firebase/auth";
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setDisplayName(currentUser?.displayName ?? "");
      setPhotoURL(currentUser?.photoURL ?? "");
    });

    return () => unsubscribe();
  }, []);
  const saveProfile = async () => {
    if (!user) {
      setFeedback("No user signed in.");
      return;
    }

    try {
      await updateProfile(user, {
        displayName: displayName || user.displayName || undefined,
        photoURL: photoURL || user.photoURL || undefined,
      });
      setFeedback("Profile updated successfully.");
      setEditMode(false);
      setUser({ ...user, displayName, photoURL } as User);
    } catch (error: any) {
      setFeedback(error.message || "Unable to update profile.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your profile
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {user?.displayName || "Admin"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A quick overview of your account and recent heart health activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft data-icon="inline-start" />
                Back to dashboard
              </Button>
            </Link>
            <Button
              variant={editMode ? "secondary" : "outline"}
              className="gap-2"
              onClick={() => {
                setEditMode((value) => !value);
                setFeedback("");
              }}
            >
              {editMode ? "Cancel" : "Edit details"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-20">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt="Profile" />
                  ) : null}

                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.displayName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() ||
                      user?.email?.slice(0, 2).toUpperCase() ||
                      "AD"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">
                    {user?.displayName || user?.email || "Your name"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Member since
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Care plan
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    General Monitoring
                  </p>
                </div>
              </div>
              {editMode ? (
                <div className="space-y-5 rounded-2xl border border-border bg-muted/70 p-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="displayName">Full name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="photoURL">Photo URL</Label>
                    <Input
                      id="photoURL"
                      type="url"
                      value={photoURL}
                      onChange={(event) => setPhotoURL(event.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  {feedback && (
                    <p className="text-sm text-primary">{feedback}</p>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="w-full" onClick={saveProfile}>
                      Save changes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditMode(false);
                        setDisplayName(user?.displayName ?? "");
                        setPhotoURL(user?.photoURL ?? "");
                        setFeedback("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <p className="text-sm font-semibold text-muted-foreground">
                    About
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Welcome, {user?.displayName || "Admin"}. Your PulseView
                    profile securely stores your ECG history, connected device
                    information, and account details. Your health data is
                    encrypted and accessible only to you.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Important info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold">
                        Secure information
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Your health readings are encrypted and only visible to
                        you.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Account status
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant={user?.emailVerified ? "default" : "secondary"}
                    >
                      {user?.emailVerified ? "Verified" : "Not Verified"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {user?.providerData?.[0]?.providerId === "google.com"
                        ? "Google Account"
                        : "Email & Password"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <p className="text-sm font-semibold">Latest ECG</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Completed 12 minutes ago with a normal rhythm reading.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/70 p-5">
                  <p className="text-sm font-semibold">Next check-in</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your next scheduled review is Thursday at 10:30 AM.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
