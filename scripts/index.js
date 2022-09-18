import BubbleManager from "../scripts/BubbleManager.js";
import BubbleTester from "../scripts/BubbleTester.js";

BubbleManager.template = await fetch("components/bubble.html");
BubbleManager.template = await BubbleManager.template.text();

let bubbleTypeElement = document.getElementById("bubble-type");
BubbleManager.type = bubbleTypeElement.value;

new BubbleManager();
updateBubbleType();

let exportBtnElement = document.getElementById("export-btn");

// Update bubble type when select menu value is changed
bubbleTypeElement.addEventListener("change", (e) => {
  updateBubbleType();
});

// Allow bubbles to define their own drop behavior
document.addEventListener("drop", (e) => e.preventDefault());

// Put the bubble text on the clipboard in MSYT format
exportBtnElement.addEventListener("click", () => putMsytToClipboard(true));
document.addEventListener("keydown", (e) => {
  if (e.code == "Enter" && e.ctrlKey && e.altKey) putMsytToClipboard();
});

function updateBubbleType() {
  BubbleManager.updateType(bubbleTypeElement.value);
}

function putMsytToClipboard(showShortcutHint) {
  let msytExport = '  - text: "';
  let lineCount = 1;
  for (let b = 0; b < BubbleManager.bubbles.length; b++) {
    let originalLineCount = lineCount;
    let bubble = BubbleManager.bubbles[b];
    if (BubbleManager.bubbles.length == 1 && !bubble.bubbleContentElement.textContent) {
      return window.alert("There's nothing to copy. Try typing some text in the dialogue bubble.");
    }
    if (bubble.element.classList.contains("overflow")) {
      return window.alert("Your text is overflowing. Locate the red bubble(s), reformat your text, and try again.");
    }
    let nodes = Array.from(bubble.bubbleContentElement.childNodes);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeValue == null) continue;
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
    while (b != BubbleManager.bubbles.length - 1 && bubble.bubbleContentElement.textContent && (lineCount == originalLineCount || lineCount % 3 != 1)) {
      msytExport += "\\n";
      lineCount++;
    }
  }
  msytExport += '"';
  navigator.clipboard.writeText(msytExport).then(
    () => {
      let alertMsg = "The MSYT output has been copied to your clipboard. You can now open your Bootup_LANG.pack file in Wildbits, open an MSBT file, and paste your MSYT output under the `content` field of any text entry.";
      window.alert(alertMsg);
    },
    () => {
      window.alert("Couldn't access the clipboard.");
    }
  );
}
