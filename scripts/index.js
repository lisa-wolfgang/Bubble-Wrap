import BubbleManager from "../scripts/BubbleManager.js";

BubbleManager.template = await fetch("../components/bubble.html");
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
  if (e.code == "Enter" && e.ctrlKey) putMsytToClipboard();
});

function updateBubbleType() {
  BubbleManager.updateType(bubbleTypeElement.value);
}

function putMsytToClipboard(showShortcutHint) {
  let msytExport = '  - text: "';
  let lineCount = 1;
  for (let b = 0; b < BubbleManager.bubbles.length; b++) {
    let bubble = BubbleManager.bubbles[b];
    if (BubbleManager.bubbles.length == 1 && !bubble.bubbleContentElement.textContent) {
      return window.alert("There's nothing to copy. Try typing some text in the dialogue bubble.");
    }
    if (bubble.element.classList.contains("overflow")) {
      return window.alert("Your text is overflowing. Locate the red bubble(s), reformat your text, and try again.");
    }
    // Note: blank bubbles will not export three line breaks like some may expect,
    // but this is actually an intended convenience feature.
    // This may be a setting if a settings page is implemented in the future.
    let nodes = Array.from(bubble.bubbleContentElement.childNodes);
    for (let i = 0; i < nodes.length; i++) {
      let rawContent = nodes[i].textContent;
      let nodeContent = rawContent ? breakTextAtWrap(bubble, rawContent) : "";
      msytExport += nodeContent;
      if (i != nodes.length - 1) {
        msytExport += "\\n";
        lineCount++;
      }
    }
    while (b != BubbleManager.bubbles.length - 1 && lineCount % 3 != 1) {
      msytExport += "\\n";
      lineCount++;
    }
  }
  msytExport += '"';
  navigator.clipboard.writeText(msytExport).then(
    () => {
      let alertMsg = "The MSYT output has been copied to your clipboard. You can now open your Bootup_LANG.pack file in Wildbits, open an MSBT file, and paste your MSYT output under the `content` field of any text entry.";
      if (showShortcutHint) alertMsg += "\n\nProtip: you can use Ctrl + Enter as a keyboard shortcut for this feature.";
      window.alert(alertMsg);
    },
    () => {
      window.alert("Couldn't access the clipboard.");
    }
  );

  function breakTextAtWrap(b, text) {
    let testBubbleText = BubbleManager.testBubble.bubbleContentElement;
    let words = text.split(" ");
    let testString;
    let outputString;
    let output = [];
    while (words.length > 0) {
      testString = "";
      testBubbleText.textContent = "";
      while (testBubbleText.offsetHeight <= b.bubbleFontSize * 1.25) {
        outputString = testString;
        if (outputString) words.splice(0, 1);
        if (words.length == 0) break;
        testString += words[0];
        if (words.length > 1) testString += " ";
        testBubbleText.textContent = testString;
      }
      // Handle words longer than one line
      if (!outputString) {
        let word = words[0].split("");
        let outputWordString;
        let outputWord = "";
        while (word.length > 0) {
          testString = "";
          testBubbleText.textContent = "";
          while (testBubbleText.offsetHeight <= b.bubbleFontSize * 1.25) {
            outputWordString = testString;
            if (outputWordString) word.splice(0, 1);
            if (word.length == 0) break;
            testString += word[0];
            testBubbleText.textContent = testString;
          }
          outputWord += outputWordString;
          if (word.length > 0) {
            outputWord = outputWord.slice(0, -1);
            outputWord += "\\n";
            lineCount++;
          }
        }
        outputString = outputWord;
        words.splice(0, 1);
      }
      if (words.length > 0) {
        outputString = outputString.split(" ").slice(0, -1).join(" ");
        lineCount++;
      }
      output.push(outputString);
    }
    return output.join("\\n");
  }
}
