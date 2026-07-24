import { TIKTOK_EMBED_WIDTH } from "@/components/TikTokEmbed";

export function extractFacebookUrl(input: string): string {
  const hrefMatch = input.match(/href=([^&"]+)/);
  if (hrefMatch) return decodeURIComponent(hrefMatch[1]);
  return input.trim();
}

export function isFacebookVideoUrl(url: string): boolean {
  return /\/(videos|reel|watch)(\/|\?)/.test(url);
}

// Matches TIKTOK_EMBED_WIDTH so reels/clips line up evenly in the same grid.
const VIDEO_WIDTH = TIKTOK_EMBED_WIDTH;
const VIDEO_HEIGHT = Math.round(VIDEO_WIDTH * (476 / 267));
const POST_WIDTH = 500;
const POST_HEIGHT = 634;

export function FacebookPostEmbed({ url }: { url: string }) {
  const contentUrl = extractFacebookUrl(url);
  const video = isFacebookVideoUrl(contentUrl);
  const width = video ? VIDEO_WIDTH : POST_WIDTH;
  const height = video ? VIDEO_HEIGHT : POST_HEIGHT;
  const src = video
    ? `https://www.facebook.com/plugins/video.php?height=${height}&href=${encodeURIComponent(contentUrl)}&show_text=false&width=${width}&t=0`
    : `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(contentUrl)}&show_text=true&width=${width}`;

  return (
    <iframe
      src={src}
      width={width}
      height={height}
      loading="lazy"
      style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
      scrolling="no"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      title="Facebook post"
    />
  );
}
