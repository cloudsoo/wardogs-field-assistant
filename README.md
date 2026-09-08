# WARDOGS FIELD ASSISTANT

Mobile-first PWA for WARDOGS coordinate and artillery assistance.

## V4
- Page 1: clean key-in calculator + Bearing Code input
- Page 2: Bakurani / Ozeti map
- One-finger map pan
- Two-finger pinch zoom on iPhone / Android
- + / − zoom controls
- Independent Gun / Target placement
- Independent LOCK GUN / LOCK TARGET
- Independent CLEAR GUN / CLEAR TARGET
- POI layers: Towers, Major Buildings / Facilities, Major Battle Areas, 1 km Grid
- POI icons and labels shrink as zoom increases
- Page 2 coordinates sync back to Page 1
- Mortar / SPH-2 firing-table lookup from the public MIT-licensed source project

## Deployment
Use Cloudflare Workers Builds connected to this repository, or serve the static files from any HTTPS host.

## iPhone install
1. Open the HTTPS site in Safari.
2. Tap Share.
3. Choose Add to Home Screen.
4. Choose Open as Web App when offered.
5. Tap Add.

## Map source
Map configuration, POI data and tiles are loaded from the public `apollyon-sys/wardogs-calculator` project. Its source code is MIT licensed. WARDOGS game assets remain the property of their respective rights holders.

## QA
A GitHub Actions workflow validates the manifest, JavaScript syntax, V4 DOM wiring, and public map / firing-table endpoints on pushes to `main`.
