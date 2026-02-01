import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "in-app-browser-warning",

  initialize() {
    withPluginApi("1.8.0", (api) => {
      try {
        const ua = navigator.userAgent || "";

        const isInApp =
          /Snapchat|Instagram|FBAN|FBAV|Line|TikTok|Twitter|LinkedIn/i.test(ua);

        if (!isInApp) return;

        api.onPageChange(() => {
          if (document.getElementById("inapp-browser-warning")) return;

          const banner = document.createElement("div");
          banner.id = "inapp-browser-warning";

          banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #b91c1c;
            color: white;
            padding: 12px;
            text-align: center;
            font-size: 14px;
            z-index: 9999;
          `;

          banner.innerHTML =
            "⚠️ Login may fail in in-app browsers. Please open this page in Safari or Chrome.";

          document.body.appendChild(banner);
        });

      } catch (e) {
        // never crash Discourse
        console.error("In-app browser warning failed safely", e);
      }
    });
  },
};
