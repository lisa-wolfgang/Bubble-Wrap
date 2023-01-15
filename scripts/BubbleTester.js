import BubbleUtil from "./BubbleUtil.js";
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
    let outputString = "";
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
            output.push(outputWord);
            outputWord = "";
          }
        }
        outputString += outputWord;
        words.splice(0, 1);
      }
      if (words.length > 0) {
        outputString = outputString.split(" ").slice(0, -1).join(" ");
      }
      output.push(outputString);
    }
    return output;
  }

  /**
   * Sorts text nodes into multiple lines using the given bubble's base text size
   * to perform wrapping. Manual line breaks are preserved.
   * @param {Bubble} b The bubble containing the text nodes to wrap.
   * @returns {Array<Array<Node>>} A new set of nodes in the format returned by
   * `BubbleUtil.getTextNodes()`.
   */
  static breakNodesAtWrap(b) {
    let wrappingBubbleContainer = BubbleManager.wrappingBubble.bubbleContentElement;
    wrappingBubbleContainer.textContent = "";
    let output = [[]];
    let currentLine = 0;
    BubbleUtil.iterateInsideBubble(b, (currentNode, newParentNode, isManualLineBreak) => {
      if (isManualLineBreak) {
        output.push([]);
        currentLine++;
        wrappingBubbleContainer.textContent = "";
      } else {
        let text = currentNode.textContent;
        let words = text.split(" ");
        let testString;
        let outputString = "";
        let newNode = currentNode.cloneNode();
        newNode.textContent = "";
        wrappingBubbleContainer.appendChild(newNode);
        while (words.length > 0) {
          let isFirstIteration = true;
          testString = "";
          // Test base font size * line spacing * max font modifier
          while (wrappingBubbleContainer.offsetHeight <= b.bubbleFontSize * 1.25 * 1.25) {
            outputString = testString;
            if (!isFirstIteration) words.splice(0, 1);
            else isFirstIteration = false;
            if (words.length == 0) break;
            testString += words[0];
            if (words.length > 1) testString += " ";
            newNode.textContent = testString;
          }
          // Handle words longer than one line
          if (!outputString && words[0]) {
            let word = words[0].split("");
            let outputWordString;
            let outputWord = "";
            while (word.length > 0) {
              testString = "";
              newNode.textContent = "";
              // Test base font size * line spacing * max font modifier
              while (wrappingBubbleContainer.offsetHeight <= b.bubbleFontSize * 1.25 * 1.25) {
                outputWordString = testString;
                if (outputWordString) word.splice(0, 1);
                if (word.length == 0) break;
                testString += word[0];
                newNode.textContent = testString;
              }
              outputWord += outputWordString;
              if (word.length > 0) {
                newNode.textContent = outputWord;
                output[currentLine].push(newNode.cloneNode(true));
                output.push([]);
                currentLine++;
                wrappingBubbleContainer.textContent = "";
                outputWord = "";
                newNode.textContent = "";
              }
            }
            words.splice(0, 1);
          }
          if (words.length > 0) {
            newNode.textContent = newNode.textContent.split(" ").slice(0, -1).join(" ");
            output[currentLine].push(newNode.cloneNode(true));
            output.push([]);
            currentLine++;
            wrappingBubbleContainer.textContent = "";
            newNode.textContent = "";
          }
        }
        output[currentLine].push(newNode);
      }
    });
    return output;
  }
}
