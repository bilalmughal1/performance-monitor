"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/card";
import { Button } from "@/components/common/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("error");
      return;
    }
    // In a real app, post to an API or form service.
    setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Contact</p>
          <h1 className="text-3xl md:text-4xl font-semibold">We&apos;d love to hear from you</h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Questions, feedback, or partnership ideas—send us a note and we&apos;ll get back to you.
          </p>
        </div>

        <Card className="bg-zinc-950/70 border-zinc-800">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>We typically respond within one business day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Name</label>
                <input
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Email</label>
                <input
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Message</label>
                <textarea
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  rows={5}
                />
              </div>

              {status === "error" && (
                <div className="text-sm text-red-400">Please fill out all fields.</div>
              )}
              {status === "sent" && (
                <div className="text-sm text-emerald-400">Message sent! We'll reply soon.</div>
              )}

              <Button type="submit" className="w-full md:w-auto" variant="premium">
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
