# Airframe — Airline Passenger Ratings

A ready-to-edit Visual Studio Code project. The website has seven service ratings and a recommendation result. The trained Random Forest runs on the backend; model details are kept out of the website.

## 1. Open and run in Visual Studio Code

1. Extract the ZIP. Open the **Airframe-GitHub-VSCode** folder in VS Code, or double-click **Airframe.code-workspace**.
2. Install Node.js **22.13 or newer** with npm, then restart VS Code if you just installed it. Check with `node --version` and `npm --version`.
3. Choose **Terminal > New Terminal**. Run:

```sh
npm ci
npm run dev
```

4. Open **http://localhost:5173** (or the Local URL printed in the terminal).
5. Keep the terminal running. Press **Ctrl+C** to stop.

No API key, ChatGPT account, Python installation or model retraining is needed to run the local website. Do not use the Live Server extension: this app needs its backend. If Windows PowerShell blocks npm.ps1, use `npm.cmd ci` and `npm.cmd run dev`, or select Command Prompt as the terminal profile.

Optional VS Code tasks are available under **Terminal > Run Task**.

## 2. Push to your GitHub repository

Install Git if it is not already available. Create an empty repository in your GitHub account. In this project's VS Code terminal, run the following, replacing the example URL with your own repository URL:

```sh
git init
git add .
git commit -m "Add Airframe passenger rating project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Sign in to GitHub when Git prompts you. Alternatively, use VS Code's Source Control > Initialize Repository > Commit > Publish Branch. This folder contains no existing Git history, account tokens or private Sites project ID. The .gitignore excludes installed packages, build output and local secrets. Keep package-lock.json and the fitted model files tracked.

Uploading to GitHub stores your source code; it does not automatically host the app. GitHub Pages cannot run this prediction backend. The current build targets Cloudflare Workers through Vinext/Vite; deploying outside your computer requires separate hosting configuration. The existing private website is unchanged by this export.

## 3. Project folders

- `app/page.tsx`: rating form and result.
- `app/globals.css`: colors and responsive styling.
- `app/api/predict/route.ts`: backend prediction endpoint.
- `lib/server/`: fitted Random Forest export and inference code. Keep these files.
- `ml/`: executed notebook, CSV, Python model, graphs, requirements and evaluation. These are not publicly served by the website.
- `checks/`: reference predictions and verification scripts.
- `docs/MODEL-AND-VERIFICATION.md`: model notes and measured results.
- `.vscode/`: optional editor setup and tasks.

The notebook and CSV are together in `ml/`. For training only, create a Python environment, install `ml/requirements.txt`, then open the notebook in Jupyter or VS Code and run its cells. The website already includes the trained model, so this is optional.

## 4. Check or build

```sh
npm run typecheck
npm run test:model
npm run build
npm start
```

`npm start` previews the production build at the address printed by Wrangler. `npm run test:site` checks a running website at port 5173. Node modules are deliberately excluded from the ZIP and will be installed by npm ci. This project uses React/TypeScript with Vinext, Vite and a Cloudflare-compatible backend.

## Dataset attribution

Borse & Mishra (2026), *Airline Travel Reviews Data (Skytrax)*, Mendeley Data v1, DOI 10.17632/vgjk58vf8h.1, CC BY 4.0.
https://data.mendeley.com/datasets/vgjk58vf8h/1

The prepared CSV is a cleaned seven-rating derivative. See `ml/provenance.json` and `ml/PROJECT_GUIDE.md` for transformations and limitations. Preserve this attribution when sharing the dataset. Third-party source licenses are retained in the build and vendor folders.
