# WARDOGS FIELD ASSISTANT V3

Mobile-first PWA for WARDOGS coordinate and artillery assistance.

## V3
- Page 1: manual coordinate key-in + bearing code check
- Page 2: interactive Bakurani/Ozeti map
- Independent Gun/Target locks
- Independent CLEAR GUN / CLEAR TARGET
- Distance + bearing + direction
- Mortar / SPH-2 selection
- Firing-table MIL lookup from the published community data source, with range status
- PWA manifest, app icon, service worker

## Map / ballistics source
Map tiles and firing tables are loaded from the public `apollyon-sys/wardogs-calculator` project. Its source code is MIT licensed. WARDOGS game assets remain property of their respective rights holders. See the source repository for its license/disclaimer.

## Cloudflare Workers deployment
This repository contains `wrangler.jsonc` for Workers Static Assets. Cloudflare's current recommended static-site path is Workers Static Assets rather than deprecated Workers Sites.

Recommended build/deploy command when using Wrangler:
`npx wrangler deploy`

For a Git-connected Workers Build, connect the repository, use the `main` branch, and use the Wrangler deploy command. The `workers.dev` URL will point to the Worker named in `wrangler.jsonc`.

## iPhone install
1. Open the HTTPS `workers.dev` URL in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Enable Open as Web App when shown.
5. Tap Add.

## QA note
The repository source has been reviewed for the requested V3 flow and map/ballistics wiring. Live iPhone Safari behavior and Cloudflare edge deployment still require a real-device/browser check because this environment cannot open the user's Cloudflare dashboard session or run a physical iPhone.
