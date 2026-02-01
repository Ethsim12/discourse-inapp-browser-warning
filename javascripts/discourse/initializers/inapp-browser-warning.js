import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "inapp-browser-warning",

  initialize() {
    withPluginApi("0.8.42", (api) => {
      if (!settings.inapp_browser_warning_enabled) return;

      // Only show on login-related routes
      const isLoginRoute = () => {
        const p = window.location.pathname || "";
        return (
          p === "/login" ||
          p.startsWith("/login") ||
          p.startsWith("/auth/") ||
          p.startsWith("/session/") ||
          p.startsWith("/u/") // optional: remove if you want it strictly login-only
        );
      };

      const ua = (navigator.userAgent || "").toLowerCase();
      const needles = (settings.inapp_browser_warning_ua_substrings || [])
        .join("|")
        .toLowerCase()
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

      const matched = needles.some((n) => ua.includes(n));
      if (!matched) return;

      api.onPageChange(() => {
        if (!isLoginRoute()) return;

        // Avoid duplicates
        if (document.querySelector(".inapp-browser-warning")) return;

        const div = document.createElement("div");
        div.className = "inapp-browser-warning";
        div.textContent = settings.inapp_browser_warning_message;

        // Insert at top of body
        document.body.prepend(div);
      });
    });
  },
};
