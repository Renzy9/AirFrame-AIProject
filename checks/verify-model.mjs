import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { predict, predictProbabilities, validateRatings } from '../lib/server/forest.js';
const bytes = readFileSync(new URL('./reference-probabilities.bin', import.meta.url));
const reference = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const options = [1, 2, 3, 4, 5, null];
let maximumError = 0;
for (let index = 0; index < 279936; index++) {
  let value = index;
  const ratings = Array(7);
  for (let j = 6; j >= 0; j--) { ratings[j] = options[value % 6]; value = Math.floor(value / 6); }
  const actual = predictProbabilities(ratings);
  for (let c = 0; c < 2; c++) maximumError = Math.max(maximumError, Math.abs(actual[c] - reference.getFloat64(index * 16 + c * 8, true)));
  const expectedClass = reference.getFloat64(index * 16 + 8, true) > reference.getFloat64(index * 16, true) ? 'Yes' : 'No';
  assert.equal(predict(ratings).recommendation, expectedClass);
}
assert.ok(maximumError < 1e-12);
const test = JSON.parse(readFileSync(new URL('./test-reference.json', import.meta.url)));
let correct = 0;
test.inputs.forEach((ratings, i) => { const output = predict(ratings); assert.equal(output.recommendation, test.predictions[i]); if (output.recommendation === test.target[i]) correct++; });
for (const input of [null, {}, [], { ratings: [] }, { ratings: Array(7).fill(null) }, { ratings: [1, 2, 3, 4, 5, 3, '5'] }, { ratings: [1, 2, 3, 4, 5, 3, 6] }, { ratings: [1, 2, 3, 4, 5, 3, 2.5] }, { ratings: [1, 2, 3, 4, 5, 3, true] }]) assert.throws(() => validateRatings(input));
assert.deepEqual(validateRatings({ ratings: [1, 2, null, 4, 5, 3, 4] }), [1, 2, null, 4, 5, 3, 4]);
const report = { all_rating_combinations: 279936, matching_test_predictions: test.inputs.length, maximum_probability_error: maximumError, reproduced_test_accuracy: correct / test.inputs.length, input_validation: 'passed' };
writeFileSync(new URL('./verification.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
