import { withPluginApi } from "discourse/lib/plugin-api";

function isInAppBrowser() {
  const ua = (navigator && navigator.userAgent) || "";
  return /snapchat|instagram|fban|fbav|fb_iab|linkedinapp|tiktok|line/i.test(ua);
}

function isLoggedIn() {
  // Works on Discourse: if currentUser exists, you're logged in
  return !!(window.Discourse && Discourse.User && Discourse.User.current());
}

function canonicalUrl() {
  const canonical = document.querySelector('link[rel="canonical"]');
  return (canonical && canonical.href) || window.location.href;
}

function ensureOverlay() {
  if (!document.documentElement.classList.contains("inapp-browser")) {
    document.documentElement.classList.add("inapp-browser");
  }

  if (document.getElementById("inapp-browser-warning-overlay")) return;

  if (!document.body) {
    setTimeout(ensureOverlay, 50);
    return;
  }

  const url = canonicalUrl();

  const overlay = document.createElement("div");
  overlay.id = "inapp-browser-warning-overlay";
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.top = "0";
  overlay.style.bottom = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.background = "rgba(0,0,0,0.86)";
  overlay.style.color = "#fff";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "18px";

  const card = document.createElement("div");
  card.style.maxWidth = "520px";
  card.style.width = "100%";
  card.style.background = "#111";
  card.style.border = "1px solid rgba(255,255,255,0.15)";
  card.style.borderRadius = "12px";
  card.style.padding = "16px";

  const h = document.createElement("div");
  h.textContent = "Login won’t work inside Snapchat / in-app browsers";
  h.style.fontWeight = "700";
  h.style.fontSize = "18px";
  h.style.marginBottom = "10px";

  const p = document.createElement("div");
  p.textContent =
    "Snapchat’s in-app browser often blocks the cookies needed for Microsoft OpenID Connect, causing login to fail. " +
    "Open this page in Safari or Chrome, then log in there.";
  p.style.fontSize = "14px";
  p.style.lineHeight = "1.45";
  p.style.marginBottom = "12px";

  const box = document.createElement("div");
  box.textContent = url;
  box.style.fontSize = "12px";
  box.style.wordBreak = "break-all";
  box.style.background = "rgba(255,255,255,0.06)";
  box.style.border = "1px solid rgba(255,255,255,0.12)";
  box.style.borderRadius = "10px";
  box.style.padding = "10px";
  box.style.marginBottom = "12px";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Copy link";
  btn.style.padding = "10px 12px";
  btn.style.borderRadius = "10px";
  btn.style.border = "1px solid rgba(255,255,255,0.2)";
  btn.style.background = "rgba(255,255,255,0.08)";
  btn.style.color = "#fff";
  btn.onclick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => window.prompt("Copy this link:", url));
    } else {
      window.prompt("Copy this link:", url);
    }
  };

  card.appendChild(h);
  card.appendChild(p);
  card.appendChild(box);
  card.appendChild(btn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function blockOidcStart() {
  // Hard block any attempt to start /auth/oidc
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target && e.target.closest && e.target.closest("a");
      if (a) {
        const href = (a.getAttribute("href") || "").toLowerCase();
        if (href.indexOf("/auth/oidc") !== -1) {
          e.preventDefault();
          e.stopPropagation();
          ensureOverlay();
        }
      }

      // Also block the login button (opens modal)
      const btn = e.target && e.target.closest && e.target.closest(".login-button, .sign-up-button");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        ensureOverlay();
      }
    },
    true
  );

  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target;
      const action = (form && form.getAttribute && form.getAttribute("action")) || "";
      if (action.toLowerCase().indexOf("/auth/oidc") !== -1) {
        e.preventDefault();
        e.stopPropagation();
        ensureOverlay();
      }
    },
    true
  );
}

export default {
  name: "inapp-browser-warning",
  initialize() {
    withPluginApi("1.8.0", (api) => {
      if (!isInAppBrowser()) return;

      // Always add class ASAP (for CSS)
      document.documentElement.classList.add("inapp-browser");

      blockOidcStart();

      const run = () => {
        // Only block logged-out users; logged-in admins should be able to browse.
        if (!isLoggedIn()) ensureOverlay();
      };

      run();
      api.onPageChange(run);
    });
  },
};