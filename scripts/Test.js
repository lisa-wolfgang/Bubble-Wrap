import Bubble from "./Bubble.js";
import BubbleManager from "./BubbleManager.js";

import ExportType from "./enums/ExportType.js";

/** Checks an input of bubble content against expected export outputs. */
export default class Test {
  /**
   * Creates a new Test.
   * @param {string[]} bubbles An array containing the `bubbleContentElement.innerHTML` of each bubble to be tested.
   * @param {Object.string} outputs An object of strings containing the expected output of the test for each export format.
   */
  constructor(bubbles, outputs) {
    this.bubbles = bubbles;
    this.outputs = outputs;
  }

  /**
   * Exports the input bubble content as if it were a real bubble chain for each available export format,
   * then compares them against the expected outputs.
   * @returns {Object.string} An object of strings containing the erroneous output (or `null` if the test evaluated
   *                          as expected) for each export format.
   */
  evaluate() {
    // Prepare test bubble content
    for (let i = 0; i < this.bubbles.length; i++) {
      // Create new bubble if needed
      if (BubbleManager.testBubbles.length - 1 < i) {
        BubbleManager.testBubbles.push(new Bubble(-1));
      }
      BubbleManager.testBubbles[i].bubbleContentElement.innerHTML = this.bubbles[i];
    }
    // Slice off any excess test bubbles
    if (BubbleManager.testBubbles.length > this.bubbles.length) {
      BubbleManager.testBubbles = BubbleManager.testBubbles.slice(0, this.bubbles.length);
    }
    // Test exporting the bubbles to all export formats with expected outputs
    const results = Object.create(this.outputs);
    for (const key in this.outputs) {
      const type = ExportType[key];
      if (!type) throw new Error(`"${key}" is not a defined ExportType. Check for typos or create a new ExportType.`);
      const parser = new type.parser();
      const result = parser.export(BubbleManager.testBubbles);
      if (result === this.outputs[key]) {
        results[key] = null;
      } else {
        results[key] = { result: result, expected: this.outputs[key] };
      }
    }
    return results;
  }
}
