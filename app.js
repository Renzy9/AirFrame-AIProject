// Read the seven rating groups from the HTML form.
const form = document.getElementById('rating-form');
const rows = [...form.querySelectorAll('[data-rating]')];
const count = document.getElementById('rated-count');
const resetButton = document.getElementById('reset-button');
const submitButton = document.getElementById('submit-button');
const errorBox = document.getElementById('form-error');
const errorText = document.getElementById('error-text');
const resultBox = document.getElementById('result');
let requestSequence = 0;
let activeRequest = null;
let loading = false;

function readRatings() {
  return rows.map(row => {
    const selected = row.querySelector('input:checked');
    return selected ? (selected.value === 'na' ? 'na' : Number(selected.value)) : null;
  });
}

// Match the stars and counter to the user's selected ratings.
function updateForm() {
  const ratings = readRatings();
  count.textContent = `${ratings.filter(value => typeof value === 'number').length} rated`;
  rows.forEach((row, index) => {
    const value = ratings[index];
    row.classList.toggle('rated', typeof value === 'number');
    row.querySelectorAll('.choice').forEach(choice => {
      const score = Number(choice.querySelector('input').value);
      choice.classList.toggle('lit', typeof value === 'number' && score <= value);
    });
  });
  resetButton.disabled = loading || ratings.every((value, index) => value === (index === 6 ? 'na' : null));
}

function setLoading(value) {
  loading = value;
  submitButton.disabled = value;
  form.setAttribute('aria-busy', String(value));
  submitButton.querySelector('.submit-ready').hidden = value;
  submitButton.querySelector('.submit-loading').hidden = !value;
  updateForm();
}

function clearResult() {
  // Editing a rating cancels an older prediction so it cannot replace a newer one.
  requestSequence += 1;
  activeRequest?.abort();
  activeRequest = null;
  resultBox.hidden = true;
  errorBox.hidden = true;
  errorText.textContent = '';
  setLoading(false);
}

function showError(message) {
  errorText.textContent = message;
  errorBox.hidden = false;
}

form.addEventListener('change', clearResult);
form.addEventListener('reset', () => {
  clearResult();
  // The browser restores the original checked values after the reset event.
  setTimeout(updateForm, 0);
});

// Send only the ratings to the backend; the trained model stays on the server.
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (loading) return;
  const ratings = readRatings();
  if (ratings.some(value => value === null)) {
    showError('Please choose a score or “Not rated” for each service.');
    return;
  }
  if (!ratings.some(value => typeof value === 'number')) {
    showError('Please rate at least one service.');
    return;
  }

  const current = ++requestSequence;
  const controller = new AbortController();
  activeRequest = controller;
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 20000);
  errorBox.hidden = true;
  resultBox.hidden = true;
  setLoading(true);

  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratings: ratings.map(value => value === 'na' ? null : value) }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'We couldn’t complete your result. Please try again.');
    if (data.recommendation !== 'Yes' && data.recommendation !== 'No') throw new Error('We couldn’t complete your result. Please try again.');
    if (current !== requestSequence) return;

    const positive = data.recommendation === 'Yes';
    document.getElementById('result-title').textContent = positive ? 'Likely to recommend' : 'Unlikely to recommend';
    document.getElementById('result-text').textContent = `Your ratings suggest you ${positive ? 'would' : 'would not'} recommend this airline.`;
    resultBox.classList.toggle('positive', positive);
    resultBox.classList.toggle('negative', !positive);
    document.getElementById('positive-icon').hidden = !positive;
    document.getElementById('negative-icon').hidden = positive;
    resultBox.hidden = false;
    resultBox.focus({ preventScroll: true });
    resultBox.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  } catch (error) {
    if (current !== requestSequence) return;
    showError(timedOut ? 'This is taking longer than expected. Please try again.' : error instanceof TypeError ? 'We couldn’t connect. Please try again.' : error.message || 'We couldn’t complete your result. Please try again.');
  } finally {
    clearTimeout(timeout);
    if (current === requestSequence) { activeRequest = null; setLoading(false); }
  }
});

updateForm();
