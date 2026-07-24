import { useEffect, useRef } from "react";

const FB_PAGE_URL = "https://www.facebook.com/people/The-Cozy-Tower/61577243422593/";

declare global {
  interface Window {
    FB?: { XFBML: { parse: (el?: HTMLElement) => void } };
  }
}

export function FacebookReviews({ tab = "reviews" }: { tab?: "reviews" | "timeline" }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById("fb-root")) {
      const root = document.createElement("div");
      root.id = "fb-root";
      document.body.prepend(root);
    }

    if (window.FB) {
      window.FB.XFBML.parse(containerRef.current ?? undefined);
      return;
    }

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, [tab]);

  return (
    <div ref={containerRef} className="flex justify-center">
      <div
        className="fb-page"
        data-href={FB_PAGE_URL}
        data-tabs={tab}
        data-width="500"
        data-height={tab === "timeline" ? "700" : "600"}
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      >
        <blockquote cite={FB_PAGE_URL} className="fb-xfbml-parse-ignore">
          <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">The Cozy Tower on Facebook</a>
        </blockquote>
      </div>
    </div>
  );
}
