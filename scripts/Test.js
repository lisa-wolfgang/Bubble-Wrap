import Bubble from "./Bubble.js";
import BubbleManager from "./BubbleManager.js";

import ExportType from "./enums/ExportType.js";

/** Checks specified bubble content against associated plaintext formats. */
export default class Test {
  /**
   * Creates a new Test.
   * @param {import("./enums/Tests.js").TestData} testData The test data to create this Test with.
   */
  constructor(testData) {
    this.testData = testData;
  }

  /**
   * Imports each available plaintext format in the Test as real bubble chains,
   * then compares them against the expected bubble DOM.
   * @returns {Object.string} An object of strings containing the erroneous output (or `null` if the test evaluated
   *                          as expected) for each export format.
   */
  tryImport() {
    // Test importing the bubbles from all export formats with expected outputs
    const results = Object.create(this.testData.exportFormats);
    for (const key in this.testData.exportFormats) {
      // Remove any existing test bubbles
      BubbleManager.testBubbles.forEach((b) => b.element.remove());
      BubbleManager.testBubbles = [];
      const type = ExportType[key];
      if (!type) throw new Error(`"${key}" is not a defined ExportType. Check for typos or create a new ExportType.`);
      const parser = new type.parser(true);
      const result = parser.import(this.testData.exportFormats[key]);
      results[key] = {
        inputDescription: this.testData.exportDescription,
        outputDescription: this.testData.bubbleDescription
      };
      if (result) {
        let doesResultMatch = true;
        const resultContent = [];
        for (let i = 0; i < BubbleManager.testBubbles.length; i++) {
          const testBubble = BubbleManager.testBubbles[i];
          resultContent.push(testBubble.bubbleContentElement.innerHTML);
          if (resultContent[i] !== this.testData.importContents[i]) doesResultMatch = false;
        }
        if (!doesResultMatch) {
          results[key]["result"] = resultContent;
          results[key]["expected"] = this.testData.importContents;
        }
      } else {
        results[key]["result"] = "Error thrown (see console above)";
        results[key]["expected"] = "Successful import";
      }
    }
    return results;
  }

  /**
   * Exports the Test's bubble content as if it were a real bubble chain for each available plaintext format,
   * then compares them against the expected outputs.
   * @returns {Object.string} An object of strings containing the erroneous output (or `null` if the test evaluated
   *                          as expected) for each export format.
   */
  tryExport() {
    // Prepare test bubble content
    for (let i = 0; i < this.testData.bubbleContents.length; i++) {
      // Create new bubble if needed
      if (BubbleManager.testBubbles.length - 1 < i) {
        BubbleManager.testBubbles.push(new Bubble(-1));
      }
      BubbleManager.testBubbles[i].bubbleContentElement.innerHTML = this.testData.bubbleContents[i];
    }
    // Slice off any excess test bubbles
    if (BubbleManager.testBubbles.length > this.testData.bubbleContents.length) {
      BubbleManager.testBubbles = BubbleManager.testBubbles.slice(0, this.testData.bubbleContents.length);
    }
    // Test exporting the bubbles to all export formats with expected outputs
    const results = Object.create(this.testData.exportFormats);
    for (const key in this.testData.exportFormats) {
      const type = ExportType[key];
      if (!type) throw new Error(`"${key}" is not a defined ExportType. Check for typos or create a new ExportType.`);
      const parser = new type.parser(true);
      const result = parser.export(BubbleManager.testBubbles);
      results[key] = {
        inputDescription: this.testData.bubbleDescription,
        outputDescription: this.testData.exportDescription
      };
      if (result !== this.testData.exportFormats[key]) {
        results[key]["result"] = result;
        results[key]["expected"] = this.testData.exportFormats[key];
      }
    }
    return results;
  }
}
