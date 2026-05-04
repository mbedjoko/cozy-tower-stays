import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trash2, Upload, Star, StarOff, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cms")({
  component: AdminCms,
});

const BUCKET = "cozy-images";

function AdminCms() {
  const [apartments, setApartments] = useState<any[]>([]);
  const [activeApt, setActiveApt] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const loadApartments = async () => {
    const { data } = await supabase.from("apartments").select("id, title").order("title");
    setApartments(data ?? []);
    if (data && data.length && !activeApt) setActiveApt(data[0].id);
  };
  const loadImages = async () => {
    if (!activeApt) return;
    const { data } = await supabase
      .from("apartment_images").select("*").eq("apartment_id", activeApt).order("sort_order");
    setImages(data ?? []);
  };
  const loadSiteImages = async () => {
    const { data } = await supabase.from("site_images").select("*").order("key");
    setSiteImages(data ?? []);
  };
  useEffect(() => { loadApartments(); loadSiteImages(); }, []);
  useEffect(() => { loadImages(); }, [activeApt]);

  const uploadApartmentImage = async (file: File) => {
    if (!activeApt) return;
    setUploading(true);
    const path = `apartments/${activeApt}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error } = await supabase.from("apartment_images").insert({
      apartment_id: activeApt, storage_path: path, url, alt: file.name, is_cover: images.length === 0, sort_order: images.length,
    });
    setUploading(false);
    if (error) toast.error(error.message); else { toast.success("Uploaded"); loadImages(); }
  };

  const deleteImage = async (img: any) => {
    if (!confirm("Delete this image?")) return;
    await supabase.storage.from(BUCKET).remove([img.storage_path]).catch(() => {});
    const { error } = await supabase.from("apartment_images").delete().eq("id", img.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); loadImages(); }
  };

  const setCover = async (img: any) => {
    await supabase.from("apartment_images").update({ is_cover: false }).eq("apartment_id", activeApt);
    const { error } = await supabase.from("apartment_images").update({ is_cover: true }).eq("id", img.id);
    if (error) toast.error(error.message); else { toast.success("Cover updated"); loadImages(); }
  };

  const uploadHero = async (file: File) => {
    setUploading(true);
    const path = `site/landing-hero-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error } = await supabase.from("site_images").upsert(
      { key: "landing_hero", storage_path: path, url, alt: "Landing hero", caption: "Find your perfect stay in Douala" },
      { onConflict: "key" }
    );
    setUploading(false);
    if (error) toast.error(error.message); else { toast.success("Hero updated — refresh the homepage"); loadSiteImages(); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Image CMS</h1>
      <p className="text-muted-foreground mt-1">Manage all images for apartments and the landing page.</p>

      {/* SITE IMAGES */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Landing page</h2>
        <div className="rounded-2xl bg-card border border-border shadow-soft p-5 grid md:grid-cols-[260px_1fr] gap-5 items-center">
          <div className="aspect-[16/10] rounded-xl bg-muted overflow-hidden grid place-items-center">
            {siteImages.find(s => s.key === "landing_hero") ? (
              <img src={siteImages.find(s => s.key === "landing_hero")!.url} alt="" className="h-full w-full object-cover" />
            ) : <ImageOff className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div>
            <h3 className="font-semibold">Hero background image</h3>
            <p className="text-sm text-muted-foreground mt-1">Used on the homepage hero section. Recommended: 1920×1280, &lt; 500 KB.</p>
            <input ref={heroFileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} />
            <Button onClick={() => heroFileRef.current?.click()} disabled={uploading} className="mt-4 gradient-cta text-secondary-foreground">
              <Upload className="h-4 w-4 mr-1.5" /> {uploading ? "Uploading…" : "Upload new hero"}
            </Button>
          </div>
        </div>
      </section>

      {/* APARTMENT IMAGES */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Apartment galleries</h2>
        <div className="rounded-2xl bg-card border border-border shadow-soft p-5">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <select value={activeApt} onChange={(e) => setActiveApt(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[260px]">
              {apartments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadApartmentImage(e.target.files[0])} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading || !activeApt} className="gradient-cta text-secondary-foreground">
              <Upload className="h-4 w-4 mr-1.5" /> {uploading ? "Uploading…" : "Add image"}
            </Button>
          </div>

          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No images yet for this apartment.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden bg-muted aspect-[4/3]">
                  <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                  {img.is_cover && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" /> Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-base grid place-items-center gap-2">
                    {!img.is_cover && (
                      <button onClick={() => setCover(img)} className="px-3 py-1.5 rounded-lg bg-white text-foreground text-xs font-semibold flex items-center gap-1">
                        <StarOff className="h-3.5 w-3.5" /> Set as cover
                      </button>
                    )}
                    <button onClick={() => deleteImage(img)} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold flex items-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
