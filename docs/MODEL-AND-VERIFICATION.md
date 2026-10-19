# Airframe — Rate your flight

A compact blue, white and orange airline rating website. Seven service rating rows lead to a recommendation result. Wi-Fi is optional; every category supports Not rated. The interface contains no model information, accuracy scores, graphs or download links.

## Run locally

Requires Node.js 22.13 or later. Run `npm ci`, then `npm run dev`. Open the Local URL printed by the server. `npm run build` creates the production Worker build; `npm start` previews it.

## Backend prediction

The browser sends seven integer ratings (1–5) or null values to `POST /api/predict`. At least one numeric rating is required. The server applies the fitted training medians and scaler, evaluates all 200 trained Random Forest trees, and returns only the Yes/No recommendation. The application does not store submissions.

The Python pipeline was retrained with the actual Wi-Fi column added. Its fitted tree structure and preprocessing parameters were exported to `lib/server/model-data.js`; `lib/server/forest.js` evaluates them on the backend. Neither module is shipped in the client bundle.

Feature order: seat comfort, cabin staff service, food and beverages, inflight entertainment, ground service, value for money, Wi-Fi/connectivity. The target is the source review's recommended Yes/No label, not a separately measured satisfaction label.

## Evaluation and source

- Test accuracy: 95.13%; balanced test accuracy: 94.67%.
- Training: 52,833 reviews from 2015–2022. Test: 11,814 reviews from 2023–August 2025.
- This is the same historical test period used in the earlier six-feature evaluation; it is not a new external test. Tuning uses training-period cross-validation.
- Public reviews are self-selected and may not represent all passengers. This classifies post-flight feedback. Logistic Regression has essentially equal balanced accuracy.
- Source: Borse & Mishra (2026), Airline Travel Reviews Data (Skytrax), Mendeley Data v1, DOI 10.17632/vgjk58vf8h.1, CC BY 4.0: https://data.mendeley.com/datasets/vgjk58vf8h/1

The separately delivered Airline-Passenger-Seven-Ratings package contains the executed notebook, prepared CSV, Python model, evaluation, and training-data correlation heatmap, boxplots and scatter matrix. These educational materials are outside the website.

## Verification

`node checks/verify-model.mjs` checks all 279,936 combinations of ratings 1–5 and missing against Python reference predictions, plus all 11,814 test predictions. The all-missing case is included in parity checks but rejected by the API.

With the site running at localhost:5173, `node checks/verify-site.mjs` checks page availability, API input validation, removed model/download pages and absence of model data in the browser bundle. The UI was also tested on desktop and at 390 px mobile width, including empty submission, positive and negative predictions, optional Wi-Fi and reset.

## Main files

- `app/page.tsx`: rating form and result.
- `app/globals.css`: responsive visual design.
- `app/api/predict/route.ts`: request validation and backend inference.
- `lib/server/`: fitted model and inference code.
- `checks/`: Python reference predictions and verification scripts/results.
