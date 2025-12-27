"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    mobile_number: "",
    bio: "",
    email: ""
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: userDa } = await supabase.auth.getUser();
      if (!userDa.user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userDa.user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          company_name: data.company_name || "",
          mobile_number: data.mobile_number || "",
          bio: data.bio || "",
          email: data.email || userDa.user.email || ""
        });
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleUpdate = async () => {
    setUpdating(true);
    const { data: userDa } = await supabase.auth.getUser();
    if (!userDa.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        company_name: formData.company_name,
        mobile_number: formData.mobile_number,
        bio: formData.bio
      })
      .eq("id", userDa.user.id);

    setUpdating(false);
    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-4 md:p-8 text-white">Loading profile...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Profile</h1>
        <p className="text-zinc-400 text-sm md:text-base">Update your personal details here.</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Profile Information</CardTitle>
          <CardDescription className="text-sm">These details are tied to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Full Name</label>
              <input
                name="full_name"
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Company Name</label>
              <input
                name="company_name"
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email Address</label>
            <input
              disabled
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
              value={formData.email}
            />
            <p className="text-xs text-zinc-600">Email cannot be changed directly.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Mobile Number</label>
            <input
              name="mobile_number"
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={formData.mobile_number}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Bio</label>
            <textarea
              name="bio"
              className="flex min-h-[100px] w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleUpdate} disabled={updating} variant="premium" className="w-full md:w-auto">
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
