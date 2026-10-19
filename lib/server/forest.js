import { gunzipSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { metadata, compressedForest } from './model-data.js';
// Imported by the server endpoint only, never the browser.
let treeData;
function getTrees() {
  if (!treeData) {
    const bytes = gunzipSync(Buffer.from(compressedForest, 'base64'));
    treeData = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  return treeData;
}
export function validateRatings(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).length !== 1 || !Array.isArray(payload.ratings) || payload.ratings.length !== 7) throw new Error('Choose a rating or “Not rated” for each of the seven services.');
  if (!payload.ratings.every((v) => v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5))) throw new Error('Ratings must be whole numbers from 1 to 5, or “Not rated”.');
  if (payload.ratings.every((v) => v === null)) throw new Error('Please rate at least one service to get a prediction.');
  return payload.ratings;
}
export function predictProbabilities(ratings) {
  const trees = getTrees();
  // Match sklearn's fitted imputer, StandardScaler, and float32 tree input.
  const values = ratings.map((v, i) => Math.fround(((v === null ? metadata.medians[i] : v) - metadata.means[i]) / metadata.scales[i]));
  let no = 0, yes = 0;
  for (const root of metadata.roots) {
    let offset = root;
    while (trees.getInt8(offset) !== -1) {
      const feature = trees.getInt8(offset);
      offset = values[feature] <= trees.getFloat64(offset + 5, true) ? offset + 13 : trees.getUint32(offset + 1, true);
    }
    no += trees.getFloat64(offset + 1, true); yes += trees.getFloat64(offset + 9, true);
  }
  return [no / metadata.tree_count, yes / metadata.tree_count];
}
export function predict(ratings) {
  const [no, yes] = predictProbabilities(ratings);
  return { recommendation: yes > no ? 'Yes' : 'No', probabilityYes: yes, ratedCount: ratings.filter((v) => v !== null).length };
}
