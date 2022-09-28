import BubbleManager from "../scripts/BubbleManager.js";
import MSYTParser from "./MSYTParser.js";

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

function putMsytToClipboard() {
  let result = MSYTParser.export(BubbleManager.bubbles, true);
  if (result) {
    navigator.clipboard.writeText(result).then(
    () => {
      let alertMsg = "The MSYT output has been copied to your clipboard. You can now open your Bootup_LANG.pack file in Wildbits, open an MSBT file, and paste your MSYT output under the `content` field of any text entry.";
      window.alert(alertMsg);
    },
    () => {
      window.alert("Couldn't access the clipboard.");
    }
  );
  }
}
