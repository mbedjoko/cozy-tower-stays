import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    if (!document.getElementById("instagram-embed-js")) {
      const script = document.createElement("script");
      script.id = "instagram-embed-js";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
          clearInterval(check);
        }
      }, 300);
      return () => clearInterval(check);
    }
  }, [url]);

  return (
    <div ref={ref}>
      <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ margin: "0 auto" }} />
    </div>
  );
}
