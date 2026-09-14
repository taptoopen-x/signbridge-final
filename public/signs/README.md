VERIFIED ISL SIGN MEDIA GOES HERE
==================================

This prototype ships with an architecture ready to display real ISL
demonstration videos, but does NOT include any video files, because no
licensed/verified ISL video dataset was available at build time.

To activate real video playback:
1. Source verified ISL demonstration clips for each vocabulary word from a
   legitimate provider (e.g. ISLRTC - Indian Sign Language Research and
   Training Centre, http://www.islrtc.nic.in, or a dataset you have the
   rights to use, such as INCLUDE / ISL-CSLTR academic datasets with proper
   attribution/license).
2. Save short (2-4s) clips as MP4, named exactly as referenced in
   src/data/signDictionary.ts, e.g.:
     water.mp4, hello.mp4, thankyou.mp4, help.mp4, yes.mp4, no.mp4,
     food.mp4, doctor.mp4, bathroom.mp4, stop.mp4, come.mp4, go.mp4,
     goodmorning.mp4, goodbye.mp4
3. Drop them in this folder (public/signs/).

Until real clips are added, the app automatically falls back to a clean
animated placeholder card (hand emoji + glossed label) so the UI never
breaks and never fakes a real video.
