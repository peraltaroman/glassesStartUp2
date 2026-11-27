# Frame Match

Live 3D eyewear try-on for optometry practices. The front camera tracks the patient's face, a true-scale 3D model of each frame follows their head, and the frame rack is ranked by face shape, skin tone, size fit and what the patient's vision plan covers.

Everything runs in the browser on the device. No video, photo or face data is uploaded.

## What it does

- **Live try-on**: Google's MediaPipe Face Landmarker tracks 478 face points (including the irises) and the full 3D head pose. The frame is placed between the pupils, rests on the nose bridge, rotates with the head, aims its arms at the person's ears, and is hidden behind the face and head where it should be. If the Face Landmarker model can't load, the app falls back to the older MediaPipe Face Mesh.
- **True scale**: the iris is about 11.7 mm wide in adults, so the camera estimates millimetres and the patient's pupillary distance (PD). Staff can enter the optician's measured PD instead for the most accurate sizing.
- **3D frames from photos**: in Practice settings, add a front photo and a side photo of a frame on a white background, plus the size printed on the arm (e.g. 49-21-140). The app cuts out the background, removes arms seen through the lenses, reads the colour, and builds the model. Frames without photos get a generated model.
- **Recommendations**: face shape and undertone from the scan, size fit from the face width, and coverage per vision plan (allowance and overage discount).
- **Snapshots** to compare frames side by side.

## Run locally

Camera access needs HTTPS or `localhost`:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

It's a static site with no build step. On Vercel: import the repository, leave every setting at its default, and deploy.

## Files

- `index.html`, `style.css`, `app.js`: the app
- `vendor/tasks-vision/`: MediaPipe Tasks Vision 1.2.3 runtime (Apache-2.0). The Face Landmarker model loads from Google's model storage (`storage.googleapis.com/mediapipe-models/...`). To host it yourself, download that file into `vendor/tasks-vision/` and change `MODEL_URL` in `app.js`.
- `vendor/face_mesh/`: MediaPipe Face Mesh 0.4.1633559619 (Apache-2.0), used as the fallback
- `vendor/three/`: three.js r160 (MIT)

## Known limits

- Face shape is scored against six typical shapes from measured proportions; the reference values are estimates and should be tuned against faces labelled by an optometrist. Undertone is a rough rule. Lighting and camera white balance shift the colour reading, and staff can correct everything.
- The camera PD is an estimate. It's best close to the camera in even light.
- Frame fronts are photos with added thickness, not full 3D scans, so very strong head turns look flatter.
- Sample catalog, brands, prices and plan values are made up.
