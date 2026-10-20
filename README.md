# Airframe — HTML and CSS website

Your interface is now plain HTML and CSS with vanilla JavaScript. It keeps the same design and seven ratings. The existing trained Random Forest still runs in the backend.

## Run locally on this Windows computer

Double-click **START-LOCAL.cmd**, then open **http://127.0.0.1:5173**. Keep its window open while using the website. Press Ctrl+C to stop. Node.js is already available on this computer; no npm install or build is needed. See RUN-LOCALLY.txt for the short instructions.

## Use the published website

https://airframe-passenger-experience.agilepeony8.chatgpt.site/

Open this link in your browser. You do not install Node.js or another app to use the published website. Its access remains private, so sign in with your authorized ChatGPT account when prompted.

## Edit in Visual Studio Code

Open this folder in VS Code, or open Airframe.code-workspace.

- index.html — all page content, seven rating groups and result section.
- styles.css — the original colors, layout and mobile styles.
- app.js — rating interaction, validation, reset and a request to /api/predict.
- favicon.svg — logo.
- backend/ — the fitted model and server prediction code.
- server.mjs — a small optional server for local testing or your own hosting.
- ml/ — executed notebook, CSV, Python model, evaluation and graphs.

There is no React, JSX, TypeScript or frontend framework in this portable package. HTML defines the structure, CSS styles it, and JavaScript submits ratings. HTML and CSS alone cannot send ratings to a prediction endpoint.

Double-clicking index.html previews the design. Actual predictions need the backend, so use the published link or run a server. VS Code Live Server and GitHub Pages serve static files only and do not run the prediction backend.

## Optional local server

Only if you want to run the full backend on your own computer: install Node.js 22.13 or newer, then open this folder's terminal and run:

```sh
node server.mjs
```

Open http://127.0.0.1:5173. No npm install, build step, API key or model retraining is needed for this portable package. Stop with Ctrl+C. A server host can set PORT and HOST as needed.

The model is stored outside the public assets. Only the six named frontend assets are served; notebook, dataset and backend files have no public download route. Do not serve the whole folder as static assets on production hosting.

## GitHub repository

The project source is hosted at https://github.com/Renzy9/AirFrame-AIProject. Clone that repository to work with its history:

```sh
git clone https://github.com/Renzy9/AirFrame-AIProject.git
```

Pushing source changes to GitHub does not deploy the prediction server. Keep backend/model-data.js with the code because it contains the fitted forest.

## Model and data

The seven-feature trained model, labels and evaluation are unchanged. The backend applies the saved preprocessing and all 200 fitted trees, then returns only the Yes/No recommendation. It does not store submissions. The notebook and three graphs remain in ml/.

Source: Borse & Mishra (2026), Airline Travel Reviews Data (Skytrax), Mendeley Data v1, DOI 10.17632/vgjk58vf8h.1, CC BY 4.0. https://data.mendeley.com/datasets/vgjk58vf8h/1

The prepared CSV is a cleaned derivative; retain the attribution and ml/provenance.json when sharing it. See ml/PROJECT_GUIDE.md for results and limits. Icon notices are in ICONS-LICENSE.txt.
