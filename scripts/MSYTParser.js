import TextColor from "./enums/TextColor.js";
import TextSize from "./enums/TextSize.js";
import BubbleUtil from "./BubbleUtil.js";
import BubbleTester from "./BubbleTester.js";
import BubbleTools from "./BubbleTools.js";

/** Houses operations that deal with converting to or from MSYT text. */
export default class MSYTParser {
  /**
   * Exports a set of Bubbles into MSYT text.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported MSYT text.
   */
  static export(bubbles, verbose) {
    let msytExport = "";
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
          msytExport += '"\n';
          textUnfinished = false;
        }
        if (bubble.animation != "none") {
          if (BubbleTools.presetAnimations.includes(bubble.animation)) {
            const animationValue = BubbleTools.presetAnimations.indexOf(bubble.animation);
            const soundValue = bubble.sound == "animation" ? animationValue + 6 : animationValue;
            msytExport += `      - control:\n`;
            msytExport += `          kind: sound\n`;
            msytExport += `          unknown:\n`;
            msytExport += `            - ${soundValue} \n`;
            msytExport += `            - 0 \n`;
          } else {
            msytExport += `      - control:\n`;
            msytExport += `          kind: animation\n`;
            msytExport += `          name: ${bubble.animation}\n`;
          }
        }
        if (bubble.sound != "none" && bubble.sound != "animation") {
          const soundArray = bubble.sound.split(" ");
          msytExport += `      - control:\n`;
          msytExport += `          kind: sound\n`;
          msytExport += `          unknown:\n`;
          msytExport += `            - ${soundArray[0]} \n`;
          msytExport += `            - ${soundArray[1]} \n`;
        }
      }

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
              msytExport += '"\n';
              textUnfinished = false;
            }
            msytExport += `      - control:\n`;
            msytExport += `          kind: pause\n`;
            msytExport += `          ${isNaN(pauseDuration) ? "length" : "frames"}: ${pauseDuration}\n`;
            continue;
          }

          // Get control node information
          let color = node.getAttribute?.("data-color") || TextColor.DEFAULT;
          previousColor = currentColor;
          currentColor = color;
          if (previousColor != currentColor) {
            if (textUnfinished) {
              msytExport += '"\n';
              textUnfinished = false;
            }
            let reset = color == TextColor.DEFAULT && !isFirst;
            msytExport += `      - control:\n`;
            msytExport += `          kind: ${reset ? "re" : ""}set_colour\n`;
            if (!reset) msytExport += `          colour: ${color}\n`;
          }

          let size = node.getAttribute?.("data-size") || TextSize.DEFAULT;
          previousSize = currentSize;
          currentSize = size;
          if (previousSize != currentSize) {
            if (textUnfinished) {
              msytExport += '"\n';
              textUnfinished = false;
            }
            msytExport += `      - control:\n`;
            msytExport += `          kind: text_size\n`;
            msytExport += `          percent: ${size}\n`;
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

          if (!textUnfinished) msytExport += `      - text: "`;
          msytExport += `${text}`;
          textUnfinished = true;
        }
        if (line != nodes.length - 1) {
          if (textUnfinished) {
            msytExport += `\\n`;
          } else {
            msytExport += `      - text: "\\n"\n`;
          }
          lineCount++;
        }
      }
      // TODO: Setting for skipping over blank bubbles on export
      while (b != bubbles.length - 1 && bubble.bubbleContentElement.textContent && (lineCount == originalLineCount || lineCount % 3 != 1)) {
        msytExport += "\\n";
        lineCount++;
      }
    }
    if (textUnfinished) {
      msytExport += '"';
    }
    return msytExport;
  }
}
