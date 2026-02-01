# Discourse In-app Browser Warning (OIDC)

Shows a banner warning on login/auth routes when users open the site in in-app browsers
(e.g. Snapchat/Instagram), which can break OIDC/OAuth cookie + state handling and cause CSRF errors.

## Install
- Discourse Admin → Customize → Themes
- Install → From a git repository
- Paste repo URL

## Settings
- Enable/disable banner
- Customize warning message
- Add/remove user-agent substrings
