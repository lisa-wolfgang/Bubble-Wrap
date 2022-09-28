import BubbleManager from "./BubbleManager.js";

/** Manages the testing and formatting of exported text from bubbles. */
export default class BubbleTester {
  /**
   * Breaks a single line of text into multiple lines using the given bubble's text size
   * to perform wrapping.
   * @param {Bubble} b The bubble whose text size the text should wrap with.
   * @param {string} text The text to wrap.
   * @returns {Array<string>} An array of individual lines of text.
   */
  static breakTextAtWrap(b, text) {
    if (text == "") return "";
    let wrappingBubbleText = BubbleManager.wrappingBubble.bubbleContentElement;
    let words = text.split(" ");
    let testString;
    let outputString;
    let output = [];
    while (words.length > 0) {
      testString = "";
      wrappingBubbleText.textContent = "";
      while (wrappingBubbleText.offsetHeight <= b.bubbleFontSize * 1.25) {
        outputString = testString;
        if (outputString) words.splice(0, 1);
        if (words.length == 0) break;
        testString += words[0];
        if (words.length > 1) testString += " ";
        wrappingBubbleText.textContent = testString;
      }
      // Handle words longer than one line
      if (!outputString) {
        let word = words[0].split("");
        let outputWordString;
        let outputWord = "";
        while (word.length > 0) {
          testString = "";
          wrappingBubbleText.textContent = "";
          while (wrappingBubbleText.offsetHeight <= b.bubbleFontSize * 1.25) {
            outputWordString = testString;
            if (outputWordString) word.splice(0, 1);
            if (word.length == 0) break;
            testString += word[0];
            wrappingBubbleText.textContent = testString;
          }
          outputWord += outputWordString;
          if (word.length > 0) {
            outputWord += "\\n";
          }
        }
        outputString = outputWord;
        words.splice(0, 1);
      }
      if (words.length > 0) {
        outputString = outputString.split(" ").slice(0, -1).join(" ");
      }
      output.push(outputString);
    }
    return output;
  }
}
