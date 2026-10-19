# Airline passenger recommendation — seven service ratings

The website now has seven ratings, including optional Wi-Fi/connectivity. It shows the rating form and recommendation result; model details and dataset graphs stay in this notebook/package.

## Results

- Random Forest test accuracy: **95.13%**.
- Balanced test accuracy: **94.67%**.
- Balanced validation accuracy: **94.14%**.
- Training accuracy: **94.73%**.
- Settings: 200 trees, maximum depth 12, minimum leaf size 5, balanced training class weights, seed 42.
- Test confusion matrix, rows actual and columns predicted, order No / Yes: [[8190, 368], [207, 3049]].
- Logistic Regression balanced test accuracy: 94.64%; the two models remain very close.

The same 52,833 earlier reviews train the model; 11,814 later reviews test it. Hyperparameters use forward validation inside the training period only. The user requested the seventh input because it is present in the original data, not because of a test-score search. The historical test set was previously evaluated, so a fresh future dataset is still needed for new external validation.

## Data and input meaning

Source: Borse & Mishra (2026), *Airline Travel Reviews Data (Skytrax)*, Mendeley Data v1, DOI 10.17632/vgjk58vf8h.1, CC BY 4.0.
Dataset: https://data.mendeley.com/datasets/vgjk58vf8h/1
Original spreadsheet: https://data.mendeley.com/public-files/datasets/vgjk58vf8h/files/ddfdec3a-4cb6-436a-ad1f-8ea70a85e4da/file_downloaded

64,740 original international online reviews, cleaned to 64,647. No synthetic records were added. These are self-selected reviews, not necessarily unique passengers or a representative survey.

The target is the reviewer's original Yes/No recommendation. It is an indicator of passenger experience, not an independently measured satisfaction label. This is post-flight classification, not future-flight forecasting.

Inputs: seat comfort, cabin crew, food/drinks, entertainment, ground service, value for money, Wi-Fi/connectivity. Each is 1–5. Wi-Fi is missing in 41,033 prepared reviews (63.5%), so the form allows “Not rated”. Missing values use medians learned from training data only. Overall ratings, review text, identities, airline names and dates are not prediction inputs.

## Graphs from the PDF examples

1. Correlation heatmap — Binary Logistic Regression, page 38. Shows how the seven training ratings vary together; it does not show causation or accuracy.
2. Box-and-whisker plots — Support Vector Machine, page 33. Shows median and spread for each observed rating.
3. Scatter matrix — Support Vector Machine, pages 35–36. Shows pairs of inputs; repeated integer scores overlap, and diagonal panels show distributions.

Graphs use training rows only and leave missing values missing. Shorter labels and adjusted figure sizes make seven inputs readable. All three rendered plots are embedded in the notebook and saved under `graphs/`.

## Run

Keep the CSV beside the notebook, install `requirements.txt`, then run the cells in order. Each code cell has a short Step comment. The full preprocessing and trained model are saved together as `random_forest_model.pkl`.
