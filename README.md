# SignBridge

AI-Powered Two-Way Indian Sign Language (ISL) Communication System — an exhibition prototype.

**Sign → Text → Speech**: webcam → MediaPipe hand landmarks → in-browser k-NN classifier → text → speech.
**Text/Voice → Sign**: typed or spoken text → word matching → ISL sign visuals.

Runs entirely in the browser. No login, no backend, no paid APIs, no camera footage ever leaves the device.

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) in Chrome or Edge, on a laptop with a webcam
and microphone.

## Before your first demo: train the classifier

There is no pretrained ISL model bundled (no verified ISL landmark dataset was available at build time).
SignBridge instead ships a genuine, working k-NN classifier you train yourself, right in the browser:

1. Go to **Sign → Text**.
2. Click **Start Camera**.
3. Scroll to **Train / Manage Signs**, pick a word (e.g. WATER), hold the sign steady, and click
   **📸 Capture Sample** 10–15 times (vary your hand position slightly each time).
4. Repeat for each word you plan to demo (WATER, HELLO, HELP, THANK YOU, YES, NO work well as a starter set).
5. Samples are saved to `localStorage` on this device/browser — they persist across reloads but are local
   to this machine.

Recognition uses a confidence threshold + a rolling temporal-smoothing window, so a single noisy frame
never flashes a wrong answer — "Sign not recognized clearly" shows instead.

## Adding real ISL video clips (optional, recommended before judging)

`public/signs/` ships empty with a README explaining exactly which filenames to add
(e.g. `water.mp4`, `hello.mp4`). Until added, sign cards show a clean emoji + label placeholder instead of
breaking. See `public/signs/README.md` for licensed source suggestions (ISLRTC, INCLUDE/ISL-CSLTR datasets).

## Build & deploy (free)

```bash
npm run build
```

Deploy the `dist/` folder to Netlify, Vercel, or GitHub Pages (all free static hosts). No environment
variables or server needed.

## Project structure

```
src/
  components/   UI, camera, sign-display, Test A Sign modal
  pages/        Landing, Sign→Text, Text→Sign, Conversation, Quick Phrases, Learn ISL, About
  services/     classifier (k-NN), speech synthesis, speech recognition
  hooks/        camera, hand landmarks (MediaPipe), combined recognition pipeline
  data/         sign dictionary + quick phrases (edit here to add vocabulary)
  context/      shared conversation history (localStorage-backed)
  utils/        landmark feature extraction, text parsing, storage
public/
  signs/        drop verified ISL video clips here (see README inside)
  icons/        drop PWA icons here (see README inside)
```
