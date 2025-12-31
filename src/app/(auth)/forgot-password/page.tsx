"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/card";
import { Button } from "@/components/common/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("idle");
    if (!email) {
      setError("Enter your email");
      return;
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>Enter your account email. We’ll email you a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSend}>
              {error && <div className="text-sm text-red-400">{error}</div>}
              {status === "sent" && <div className="text-sm text-emerald-400">Check your email for the reset link.</div>}
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" variant="premium" className="w-full">
                Send reset link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
