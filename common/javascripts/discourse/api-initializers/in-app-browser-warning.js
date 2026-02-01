import apiInitializer from "discourse/lib/api";

function isProbablyInAppBrowser(ua) {
  return /snapchat|instagram|fban|fbav|fb_iab|linkedinapp|tiktok|line/i.test(ua);
}

function ensureBanner() {
  if (document.getElementById("inapp-browser-warning")) return;
  if (!document.body) {
    setTimeout(ensureBanner, 50);
    return;
  }

  const banner = document.createElement("div");
  banner.id = "inapp-browser-warning";
  banner.textContent =
    "Login may fail in in-app browsers (Snapchat/Instagram/etc). Open in Safari/Chrome.";

  document.body.appendChild(banner);
}

export default apiInitializer("1.8.0", (api) => {
  const ua = (navigator && navigator.userAgent) || "";
  if (!isProbablyInAppBrowser(ua)) return;

  ensureBanner();
  api.onPageChange(() => ensureBanner());
});