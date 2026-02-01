import { withPluginApi } from "discourse/lib/plugin-api";

function isProbablyInAppBrowser(ua) {
  // common in-app browsers that are known to break auth/session flows
  // (Snapchat, Instagram, Facebook, LinkedIn, TikTok, LINE, etc.)
  return /snapchat|instagram|fban|fbav|fb_iab|linkedinapp|tiktok|line/i.test(ua);
}

function ensureBanner() {
  try {
    if (document.getElementById("inapp-browser-warning")) return;

    // if body isn't ready yet, retry very shortly
    if (!document.body) {
      setTimeout(ensureBanner, 50);
      return;
    }

    const banner = document.createElement("div");
    banner.id = "inapp-browser-warning";

    // Avoid template literals to keep the theme compiler maximally happy
    banner.style.position = "fixed";
    banner.style.left = "0";
    banner.style.right = "0";
    banner.style.bottom = "0";
    banner.style.zIndex = "9999";
    banner.style.background = "#b91c1c";
    banner.style.color = "white";
    banner.style.padding = "12px";
    banner.style.textAlign = "center";
    banner.style.fontSize = "14px";
    banner.style.lineHeight = "1.3";

    // No emoji (optional), keep it plain to avoid weird rendering
    banner.textContent =
      "Login may fail in in-app browsers (Snapchat/Instagram/etc). Please open in Safari or Chrome.";

    document.body.appendChild(banner);
  } catch (e) {
    // never crash Discourse
    // eslint-disable-next-line no-console
    console.error("In-app browser warning failed safely", e);
  }
}

export default {
  name: "in-app-browser-warning",

  initialize() {
    withPluginApi("1.8.0", (api) => {
      try {
        const ua = (navigator && navigator.userAgent) || "";

        if (!isProbablyInAppBrowser(ua)) return;

        // Run immediately (first paint) and also after route changes.
        ensureBanner();
        api.onPageChange(() => ensureBanner());
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("In-app browser warning initializer failed safely", e);
      }
    });
  },
};