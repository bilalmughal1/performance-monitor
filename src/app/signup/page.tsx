"use client";

import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight } from "lucide-react";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full Name is required"),
  companyName: z.string().optional(),
  mobileNumber: z.string().optional(),
  bio: z.string().optional(),
});

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    mobileNumber: "",
    bio: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    setError("");

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const formatted = result.error.format();
      const firstError = formatted.email?._errors?.[0] ||
        formatted.password?._errors?.[0] ||
        formatted.fullName?._errors?.[0] ||
        "Invalid input";
      setError(firstError);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          company_name: formData.companyName,
          mobile_number: formData.mobileNumber,
          bio: formData.bio
        }
      }
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists. Please log in or reset your password.");
      } else {
        setError(error.message);
      }
      return;
    }

    alert("Check your email to confirm your account");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[128px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[128px]" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl">
            <Zap className="h-6 w-6 text-indigo-500" fill="currentColor" />
            <span>PerfMonitor</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
          <p className="text-zinc-400">Start monitoring your web performance today.</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your details below to create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Full Name *</label>
                  <input
                    name="fullName"
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Company Name</label>
                  <input
                    name="companyName"
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                    placeholder="Acme Inc."
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Mobile Number</label>
                <input
                  name="mobileNumber"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                  placeholder="+1 (555) 000-0000"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email *</label>
                <input
                  name="email"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">Password *</label>
                  <button
                    type="button"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  name="password"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-zinc-500">Min 6 characters</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Bio</label>
                <textarea
                  name="bio"
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white resize-none"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  // @ts-ignore
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" className="w-full" variant="premium" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
