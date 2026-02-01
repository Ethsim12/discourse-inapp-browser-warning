import { withPluginApi } from "discourse/lib/plugin-api";

function isProbablyInAppBrowser(ua) {
  return /snapchat|instagram|fban|fbav|fb_iab|linkedinapp|tiktok|line/i.test(ua);
}

function getCanonicalUrl() {
  // Prefer canonical URL if present, else fallback to current
  const canonical = document.querySelector('link[rel="canonical"]');
  return (canonical && canonical.href) || window.location.href;
}

function tryCopy(text) {
  // Best-effort: Clipboard API first, fallback to prompt
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve) => {
    // fallback prompt (works widely)
    window.prompt("Copy this link:", text);
    resolve();
  });
}

function canOpenChrome() {
  // Not perfect, but useful: only show if scheme likely exists
  // (Chrome installed) - we can't reliably detect, so we show it anyway.
  return true;
}

function toChromeUrl(httpUrl) {
  // Convert https://example.com -> googlechrome://example.com
  // Convert http://example.com  -> googlechrome://example.com
  return httpUrl.replace(/^https?:\/\//i, "googlechrome://");
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
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.color = "#fff";
  overlay.style.padding = "20px";
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
  card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";

  const title = document.createElement("div");
  title.textContent = "Login won’t work in this in-app browser";
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const body = document.createElement("div");
  body.style.fontSize = "14px";
  body.style.lineHeight = "1.45";
  body.style.opacity = "0.95";
  body.style.marginBottom = "14px";
  body.textContent =
    "This app’s built-in browser often blocks the cookies needed for OpenID Connect, causing CSRF/state failures. " +
    "Open this page in Safari (recommended) or Chrome, then log in again.";

  const steps = document.createElement("div");
  steps.style.fontSize = "13px";
  steps.style.lineHeight = "1.45";
  steps.style.opacity = "0.9";
  steps.style.marginBottom = "14px";
  steps.textContent =
    "Safari: tap the ⋯ / share button in this app, then choose “Open in Safari”. " +
    "Or copy the link below and paste it into Safari/Chrome.";

  const urlBox = document.createElement("div");
  urlBox.style.fontSize = "12px";
  urlBox.style.wordBreak = "break-all";
  urlBox.style.background = "rgba(255,255,255,0.06)";
  urlBox.style.border = "1px solid rgba(255,255,255,0.12)";
  urlBox.style.borderRadius = "10px";
  urlBox.style.padding = "10px";
  urlBox.style.marginBottom = "14px";
  urlBox.textContent = url;

  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.gap = "10px";
  buttons.style.flexWrap = "wrap";

  const btnCopy = document.createElement("button");
  btnCopy.type = "button";
  btnCopy.textContent = "Copy link";
  btnCopy.style.padding = "10px 12px";
  btnCopy.style.borderRadius = "10px";
  btnCopy.style.border = "1px solid rgba(255,255,255,0.2)";
  btnCopy.style.background = "rgba(255,255,255,0.08)";
  btnCopy.style.color = "#fff";
  btnCopy.style.cursor = "pointer";
  btnCopy.onclick = () => {
    tryCopy(url).catch(() => {});
  };

  const btnChrome = document.createElement("button");
  btnChrome.type = "button";
  btnChrome.textContent = "Open in Chrome";
  btnChrome.style.padding = "10px 12px";
  btnChrome.style.borderRadius = "10px";
  btnChrome.style.border = "1px solid rgba(255,255,255,0.2)";
  btnChrome.style.background = "rgba(255,255,255,0.08)";
  btnChrome.style.color = "#fff";
  btnChrome.style.cursor = "pointer";
  btnChrome.onclick = () => {
    // If Chrome is installed, iOS should hand off. If not, it fails harmlessly.
    window.location.href = toChromeUrl(url);
  };

  // If you *really* want: allow dismiss for admins only (optional)
  // For normal users, keep it persistent (don’t add a close button).

  buttons.appendChild(btnCopy);
  if (canOpenChrome()) buttons.appendChild(btnChrome);

  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(steps);
  card.appendChild(urlBox);
  card.appendChild(buttons);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

import { withPluginApi } from "discourse/lib/plugin-api";

function isProbablyInAppBrowser(ua) {
  return /snapchat|instagram|fban|fbav|fb_iab|linkedinapp|tiktok|line/i.test(ua);
}

function getCanonicalUrl() {
  const canonical = document.querySelector('link[rel="canonical"]');
  return (canonical && canonical.href) || window.location.href;
}

function ensureOverlay() {
  try {
    if (document.getElementById("inapp-browser-warning-overlay")) return;

    if (!document.body) {
      setTimeout(ensureOverlay, 50);
      return;
    }

    const url = getCanonicalUrl();

    const overlay = document.createElement("div");
    overlay.id = "inapp-browser-warning-overlay";
    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.top = "0";
    overlay.style.bottom = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.color = "#fff";
    overlay.style.padding = "20px";
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
      "This in-app browser often blocks the cookies needed for OpenID Connect, causing CSRF/state failures. " +
      "Open this page in Safari or Chrome, then log in again.";
    body.style.fontSize = "14px";
    body.style.lineHeight = "1.45";
    body.style.marginBottom = "12px";

    const steps = document.createElement("div");
    steps.textContent =
      "Safari: tap the ⋯ / share button, then choose “Open in Safari”. " +
      "Or copy this link and paste it into Safari/Chrome:";
    steps.style.fontSize = "13px";
    steps.style.lineHeight = "1.45";
    steps.style.opacity = "0.9";
    steps.style.marginBottom = "10px";

    const urlBox = document.createElement("div");
    urlBox.textContent = url;
    urlBox.style.fontSize = "12px";
    urlBox.style.wordBreak = "break-all";
    urlBox.style.background = "rgba(255,255,255,0.06)";
    urlBox.style.border = "1px solid rgba(255,255,255,0.12)";
    urlBox.style.borderRadius = "10px";
    urlBox.style.padding = "10px";
    urlBox.style.marginBottom = "12px";

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "10px";
    btnRow.style.flexWrap = "wrap";

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

    btnRow.appendChild(btnCopy);

    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(steps);
    card.appendChild(urlBox);
    card.appendChild(btnRow);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("In-app browser warning overlay failed safely", e);
  }
}

function shouldBlockTarget(el) {
  if (!el) return false;

  // Block forms that post to /auth/oidc
  if (el.tagName === "FORM") {
    const action = (el.getAttribute("action") || "").toLowerCase();
    if (action.indexOf("/auth/oidc") !== -1) return true;
  }

  // Block links/buttons that point at /auth/oidc
  if (el.getAttribute) {
    const href = (el.getAttribute("href") || "").toLowerCase();
    if (href.indexOf("/auth/oidc") !== -1) return true;
  }

  return false;
}

function installBlockers() {
  // 1) Block FORM submits to /auth/oidc (this is the big one)
  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target;
      if (shouldBlockTarget(form)) {
        ensureOverlay();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // 2) Block click-taps that would start /auth/oidc
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target && e.target.closest && e.target.closest("a, button, form");
      if (!el) return;

      // If the click is inside a form that submits to /auth/oidc, block it
      const form = e.target && e.target.form;
      if (shouldBlockTarget(form)) {
        ensureOverlay();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Or if it’s a direct link to /auth/oidc
      if (shouldBlockTarget(el)) {
        ensureOverlay();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}

export default {
  name: "in-app-browser-warning",

  initialize() {
    withPluginApi("1.8.0", (api) => {
      const ua = (navigator && navigator.userAgent) || "";
      if (!isProbablyInAppBrowser(ua)) return;

      // install blockers once
      installBlockers();

      // ensure overlay persists across route changes
      ensureOverlay();
      api.onPageChange(() => ensureOverlay());
    });
  },
};

export default {
  name: "in-app-browser-warning",

  initialize() {
    withPluginApi("1.8.0", (api) => {
      const ua = (navigator && navigator.userAgent) || "";
      if (!isProbablyInAppBrowser(ua)) return;

      // Make it persistent across route changes
      ensureOverlay();
      api.onPageChange(() => ensureOverlay());

      // Prevent users from starting the broken OIDC flow in this webview
      blockOidcClicks();
    });
  },
};