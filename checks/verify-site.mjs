import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { compressedForest } from '../lib/server/model-data.js';
const base = 'http://127.0.0.1:5173';
const results = [];
let previewRestarts = 0;
async function fetchSite(...args) {
  let response = await fetch(...args);
  if (response.status === 503 && (await response.clone().text()).includes('Your worker restarted mid-request')) {
    previewRestarts++; response = await fetch(...args);
  }
  return response;
}
for (const path of ['/']) {
  const response = await fetchSite(base + path); assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('Airframe'));
  assert.ok(!/Random Forest|balanced accuracy|About the model|dataset|training notebook/i.test(html));
  results.push({ path, status: 200 });
}
for (const path of ['/about', '/downloads/airline_passenger_random_forest.ipynb', '/downloads/airline_passenger_reviews.csv', '/downloads/project-guide.md']) {
  const response = await fetchSite(base + path); assert.equal(response.status, 404);
  results.push({ path, status: 404 });
}
const cases = [
  { body: { ratings: [5,5,5,5,5,5,5] }, status: 200, recommendation: 'Yes' },
  { body: { ratings: [1,1,1,1,1,1,1] }, status: 200, recommendation: 'No' },
  { body: { ratings: [4,5,null,null,4,4,null] }, status: 200, recommendation: 'Yes' },
  { body: { ratings: [null,null,null,null,null,4,null] }, status: 200 },
  { body: { ratings: [null,null,null,null,null,null,null] }, status: 400 },
  { body: { ratings: [1,2,3,4,5,3,6] }, status: 400 },
  { body: { ratings: [1,2,3,4,5,3,'4'] }, status: 400 },
  { body: { ratings: [1,2,3,4,5,3,2.5] }, status: 400 },
  { body: { ratings: [1,2,3,4,5] }, status: 400 },
  { body: {}, status: 400 },
  { body: '{', raw: true, status: 400 },
  { body: 'x'.repeat(5000), raw: true, status: 413 },
];
for (const item of cases) {
  const response = await fetchSite(base + '/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: item.raw ? item.body : JSON.stringify(item.body) });
  assert.equal(response.status, item.status); assert.equal(response.headers.get('cache-control'), 'no-store');
  const data = await response.json();
  if (item.recommendation) assert.equal(data.recommendation, item.recommendation);
  if (item.status === 200) assert.deepEqual(Object.keys(data), ['recommendation']);
}
assert.equal((await fetchSite(base + '/api/predict', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'text' })).status, 415);
assert.equal((await fetchSite(base + '/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.org' }, body: JSON.stringify({ ratings: [5,5,5,5,5,5] }) })).status, 403);
assert.equal((await fetchSite(base + '/api/predict')).status, 405);
assert.equal((await fetchSite(base + '/lib/server/model-data.js')).status, 404);
function walk(path) { return readdirSync(path).flatMap((name) => { const p = join(path, name); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const clientFiles = walk(new URL('../dist/client', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
for (const file of clientFiles.filter((file) => file.endsWith('.js') || file.endsWith('.html'))) assert.ok(!readFileSync(file, 'utf8').includes(compressedForest.slice(0, 100)), 'Model data must not be bundled in browser files');
const report = { pages_and_downloads: results, api_cases: 15, local_preview_restart_retries: previewRestarts, api_validation: 'passed', private_model_path_status: 404, no_model_in_client_bundle: true };
writeFileSync(new URL('./site-verification.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
