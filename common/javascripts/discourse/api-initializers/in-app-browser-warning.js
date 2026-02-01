import { withPluginApi } from "discourse/lib/plugin-api";

function isProbablyInAppBrowser() {
  const ua = (navigator && navigator.userAgent) || "";
  return /snapchat|instagram|fban|fbav|fb_iab|fbios|facebook|linkedinapp|tiktok|line/i.test(
    ua
  );
}

function getCanonicalUrl() {
  const canonical = document.querySelector('link[rel="canonical"]');
  return (canonical && canonical.href) || window.location.href;
}

function ensureOverlay() {
  if (document.getElementById("inapp-browser-warning-overlay")) return;

  if (!document.body) {
    setTimeout(ensureOverlay, 50);
    return;
  }

  const url = getCanonicalUrl();

  const overlay = document.createElement("div");
  overlay.id = "inapp-browser-warning-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.background = "rgba(0,0,0,0.86)";
  overlay.style.color = "#fff";
  overlay.style.padding = "18px";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const card = document.createElement("div");
  card.style.maxWidth = "520px";
  card.style.width = "100%";
  card.style.background = "#111";
  card.style.border = "1px solid rgba(255,255,255,0.15)";
  card.style.borderRadius = "12px";
  card.style.padding = "16px";

  const title = document.createElement("div");
  title.textContent = "Login won’t work in this in-app browser";
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const body = document.createElement("div");
  body.textContent =
    "This in-app browser often blocks the cookies needed for Microsoft OpenID Connect, causing CSRF/state failures. " +
    "Open this page in Safari (recommended) or Chrome, then log in again.";
  body.style.fontSize = "14px";
  body.style.lineHeight = "1.45";
  body.style.marginBottom = "12px";

  const urlBox = document.createElement("div");
  urlBox.textContent = url;
  urlBox.style.fontSize = "12px";
  urlBox.style.wordBreak = "break-all";
  urlBox.style.background = "rgba(255,255,255,0.06)";
  urlBox.style.border = "1px solid rgba(255,255,255,0.12)";
  urlBox.style.borderRadius = "10px";
  urlBox.style.padding = "10px";
  urlBox.style.marginBottom = "12px";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "10px";
  row.style.flexWrap = "wrap";

  const btnCopy = document.createElement("button");
  btnCopy.type = "button";
  btnCopy.textContent = "Copy link";
  btnCopy.style.padding = "10px 12px";
  btnCopy.style.borderRadius = "10px";
  btnCopy.style.border = "1px solid rgba(255,255,255,0.2)";
  btnCopy.style.background = "rgba(255,255,255,0.08)";
  btnCopy.style.color = "#fff";
  btnCopy.onclick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        window.prompt("Copy this link:", url);
      });
    } else {
      window.prompt("Copy this link:", url);
    }
  };

  const btnChrome = document.createElement("button");
  btnChrome.type = "button";
  btnChrome.textContent = "Open in Chrome";
  btnChrome.style.padding = "10px 12px";
  btnChrome.style.borderRadius = "10px";
  btnChrome.style.border = "1px solid rgba(255,255,255,0.2)";
  btnChrome.style.background = "rgba(255,255,255,0.08)";
  btnChrome.style.color = "#fff";
  btnChrome.onclick = () => {
    // iOS will hand off to Chrome if installed, else it fails harmlessly.
    window.location.href = url.replace(/^https?:\/\//i, "googlechrome://");
  };

  row.appendChild(btnCopy);
  row.appendChild(btnChrome);

  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(urlBox);
  card.appendChild(row);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function blockOidcStart() {
  // Block form submits and link clicks that would start /auth/oidc
  const shouldBlock = (el) => {
    if (!el) return false;

    if (el.tagName === "FORM") {
      const action = (el.getAttribute("action") || "").toLowerCase();
      return action.indexOf("/auth/oidc") !== -1;
    }

    const href = (el.getAttribute && el.getAttribute("href")) || "";
    return href.toLowerCase().indexOf("/auth/oidc") !== -1;
  };

  document.addEventListener(
    "submit",
    (e) => {
      if (shouldBlock(e.target)) {
        ensureOverlay();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  document.addEventListener(
    "click",
    (e) => {
      const el = e.target && e.target.closest && e.target.closest("a, button");
      if (!el) return;

      // Direct link to /auth/oidc
      if (shouldBlock(el)) {
        ensureOverlay();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Button inside a form posting to /auth/oidc
      const form = e.target && e.target.form;
      if (shouldBlock(form)) {
        ensureOverlay();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}

function isLoginRelatedPath() {
  const p = window.location.pathname || "";
  const q = window.location.search || "";
  return (
    p.indexOf("/login") === 0 ||
    p.indexOf("/auth/") === 0 ||
    p.indexOf("/u/") === 0 ||
    q.indexOf("csrf_detected") !== -1
  );
}

export default {
  name: "inapp-browser-warning",
  initialize() {
    withPluginApi("1.8.0", (api) => {
      if (!isProbablyInAppBrowser()) return;

      // Make sure we never start the broken flow in the webview
      blockOidcStart();

      // Show the overlay on login-related routes and on auth failures
      const run = () => {
        if (isLoginRelatedPath()) ensureOverlay();
      };

      run();
      api.onPageChange(run);
    });
  },
};