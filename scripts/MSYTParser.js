import BubbleTester from "./BubbleTester.js";

/** Houses operations that deal with converting to or from MSYT text. */
export default class MSYTParser {
  /**
   * Exports a set of Bubbles into MSYT text.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported MSYT text.
   */
  static export(bubbles, verbose) {
    let msytExport = '  - text: "';
    let lineCount = 1;
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
      let nodes = Array.from(bubble.bubbleContentElement.childNodes);
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].nodeValue && !nodes[i].childNodes[0]) continue;
        let rawContent = nodes[i].textContent;
        let contentLines = rawContent ? BubbleTester.breakTextAtWrap(bubble, rawContent) : "";
        if (rawContent) lineCount += contentLines.length - 1;
        let nodeContent = rawContent ? contentLines.join("\\n") : "";
        // Convenience conversions
        let replaceDict = {
          "--": "—",
          '"': '\\"'
        };
        for (const [key, val] of Object.entries(replaceDict)) {
          nodeContent = nodeContent.replaceAll(key, val);
        }
        msytExport += nodeContent;
        if (i != nodes.length - 1) {
          msytExport += "\\n";
          lineCount++;
        }
      }
      // TODO: Setting for skipping over blank bubbles on export
      while (b != bubbles.length - 1 && bubble.bubbleContentElement.textContent && (lineCount == originalLineCount || lineCount % 3 != 1)) {
        msytExport += "\\n";
        lineCount++;
      }
    }
    msytExport += '"';
    return msytExport;
  }
}
