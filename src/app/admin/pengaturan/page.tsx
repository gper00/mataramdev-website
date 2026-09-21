import { createClient } from "@/lib/supabase/server";
import CommunitySettingsForm from "./CommunitySettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("community_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pengaturan Komunitas
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Kelola informasi umum komunitas Mataram Dev.
        </p>
      </div>

      <CommunitySettingsForm
        initialData={{
          name: settings?.name || "",
          description: settings?.description || "",
          keywords: settings?.keywords?.join(", ") || "",
          address: settings?.address || "",
          mapsLocation: settings?.maps_location || "",
        }}
      />
    </div>
  );
}
