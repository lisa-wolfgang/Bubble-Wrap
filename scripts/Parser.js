import TextColor from "./enums/TextColor.js";
import TextSize from "./enums/TextSize.js";
import BubbleUtil from "./BubbleUtil.js";
import BubbleTester from "./BubbleTester.js";
import BubbleTools from "./BubbleTools.js";

/** A base class for converting Bubble Wrap data to or from plaintext formats. */
export default class Parser {
  /** Creates a new {@link Parser}. */
  constructor() {
    if (this.constructor == Parser) {
      throw new Error("`Parser` should not be instantiated directly. Use `MSYTParser` or `MSBTEditorParser` instead.");
    }
    this.plaintextExport = "";
  }

  /**
   * Exports a set of Bubbles into plaintext.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported plaintext.
   */
  export(bubbles, verbose) {
    this.plaintextExport = "";

    let lineCount = 1;
    let currentColor = TextColor.DEFAULT;
    let currentSize = TextSize.DEFAULT;
    let previousColor, previousSize;
    let textUnfinished = false;
    for (let b = 0; b < bubbles.length; b++) {
      let originalLineCount = lineCount;
      let bubble = bubbles[b];
      if (verbose && bubbles.length == 1 && !bubble.bubbleContentElement.textContent) {
        window.alert("There's nothing to copy. Try typing some text in the dialogue bubble.");
        return undefined;
      }
      if (verbose && bubble.element.classList.contains("overflow")) {
        window.alert("Your text is overflowing. Locate the red bubble(s), reformat your text, and try again.");
        return undefined;
      }

      // Bubble property control nodes (animation, sound)
      if (bubble.animation != "none" || bubble.sound != "none") {
        if (textUnfinished) {
          this.endTextNode(false);
          textUnfinished = false;
        }
        if (bubble.animation != "none") {
          if (BubbleTools.presetAnimations.includes(bubble.animation)) {
            // Preset animation/sound
            this.addPresetAnimNode(bubble);
          } else {
            // Custom animation name
            this.addAnimationNode(bubble.animation);
          }
        }
        if (bubble.sound != "none" && bubble.sound != "animation") {
          // Custom sound value
          this.addSoundNode(bubble.sound);
        }
      }

      // Text and inline control nodes
      let nodes = BubbleTester.breakNodesAtWrap(bubble);
      let text;
      for (let line = 0; line < nodes.length; line++) {
        for (let n = 0; n < nodes[line].length; n++) {
          let node = nodes[line][n];
          if (!node.nodeValue && !node.childNodes[0] && !node.getAttribute?.("data-pause")) continue;
          let isFirst = !previousColor;

          // If this is a pause node, parse and continue to next node
          let pauseDuration = node.getAttribute?.("data-pause");
          if (pauseDuration) {
            if (textUnfinished) {
              this.endTextNode(false);
              textUnfinished = false;
            }
            this.addPauseNode(pauseDuration);
            continue;
          }

          // Get color node information
          let color = node.getAttribute?.("data-color") || TextColor.DEFAULT;
          previousColor = currentColor;
          currentColor = color;
          if (previousColor != currentColor) {
            if (textUnfinished) {
              this.endTextNode(false);
              textUnfinished = false;
            }
            let reset = color == TextColor.DEFAULT && !isFirst;
            this.addColorNode(color, reset);
          }

          // Get size node information
          let size = node.getAttribute?.("data-size") || TextSize.DEFAULT;
          previousSize = currentSize;
          currentSize = size;
          if (previousSize != currentSize) {
            if (textUnfinished) {
              this.endTextNode(false);
              textUnfinished = false;
            }
            this.addSizeNode(size);
          }

          // Get text
          text = node.textContent;
          // Convenience conversions
          let replaceDict = {
            "--": "—",
            '"': '\\"'
          };
          for (const [key, val] of Object.entries(replaceDict)) {
            text = text.replaceAll(key, val);
          }

          if (!textUnfinished) this.startTextNode();
          this.plaintextExport += `${text}`;
          textUnfinished = true;
        }
        if (line != nodes.length - 1) {
          if (!textUnfinished) {
            this.startTextNode();
            textUnfinished = true;
          }
          this.addLineBreak();
          lineCount++;
        }
      }
      // Add the remaining "empty lines" to get to the next bubble
      // TODO: Setting for skipping over blank bubbles on export
      while (b != bubbles.length - 1 && bubble.bubbleContentElement.textContent && (lineCount == originalLineCount || lineCount % 3 != 1)) {
        this.addLineBreak();
        lineCount++;
      }
    }
    if (textUnfinished) {
      this.endTextNode(true);
    }
    return this.plaintextExport;
  }

  // The following methods are to be defined in child classes:
  startTextNode() {}
  addLineBreak() {}
  endTextNode() {}
  addPresetAnimNode() {}
  addAnimationNode() {}
  addSoundNode() {}
  addPauseNode() {}
  addColorNode() {}
  addSizeNode() {}
}
