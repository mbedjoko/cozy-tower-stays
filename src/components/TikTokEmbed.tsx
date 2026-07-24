import { useEffect } from "react";

// 330px comfortably fits both TikTok's minimum (325px) and Instagram's
// minimum embed width (326px), so all three clip types line up evenly.
export const TIKTOK_EMBED_WIDTH = 330;

// TikTok's embed.js scans the whole DOM once when it finishes loading, so as
// long as every blockquote is already rendered by then, one script load
// (shared across every TikTokEmbed instance on the page) is enough — no need
// to re-inject per instance.
export function TikTokEmbed({ url }: { url: string }) {
  useEffect(() => {
    if (!document.getElementById("tiktok-embed-js")) {
      const script = document.createElement("script");
      script.id = "tiktok-embed-js";
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const videoId = url.match(/\/(?:video|photo)\/(\d+)/)?.[1];

  return (
    <blockquote className="tiktok-embed" cite={url} data-video-id={videoId} style={{ maxWidth: TIKTOK_EMBED_WIDTH, minWidth: TIKTOK_EMBED_WIDTH, margin: "0 auto" }}>
      <section>
        <a target="_blank" rel="noopener noreferrer" href={url}>View on TikTok</a>
      </section>
    </blockquote>
  );
}
