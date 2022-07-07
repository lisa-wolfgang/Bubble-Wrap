let bubbleTypeElement = document.getElementById("bubble-type");
let bubbleElement = document.querySelector(".bubble");
let bubbleContentElement = document.querySelector(".bubble-content");
let exportBtnElement = document.getElementById("export-btn");

let bubbleType = bubbleTypeElement.value;
let bubbleFontSize = parseInt(window.getComputedStyle(bubbleContentElement).getPropertyValue("font-size"));
let bubbleValue = "";

// Sets the previously selected bubble type on page load
bubbleElement.classList.add("no-transition");
updateBubbleType();
bubbleElement.parentElement.offsetHeight; // necessary to force CSS reload in time
bubbleElement.classList.remove("no-transition");

// Create test bubble
let testBubbleText = document.createElement("div");
testBubbleText.classList.add("bubble-content");
let testBubbleElement = document.createElement("div");
testBubbleElement.classList.add("bubble", "test-bubble");
testBubbleElement.appendChild(testBubbleText);
document.body.appendChild(testBubbleElement);

// Update bubble type when select menu value is changed
bubbleTypeElement.addEventListener("change", () => {
  updateBubbleType();
});

// Focus the bubble text input when any part of the bubble is clicked
bubbleElement.addEventListener("mousedown", (e) => {
  if (e.target == bubbleElement) e.preventDefault(); // prevents unfocus on text when clicked
  bubbleContentElement.focus();
});

// Clear formatting on anything pasted into the bubble
bubbleContentElement.addEventListener("paste", (e) => sanitizePaste(e));
document.addEventListener("drop", (e) => e.preventDefault());
bubbleContentElement.addEventListener("drop", (e) => sanitizeDrop(e));

// Flag input over three lines long
bubbleContentElement.addEventListener("input", (e) => {
  testBubbleText.innerHTML = bubbleContentElement.innerHTML;
  if (testBubbleText.offsetHeight > bubbleFontSize * 1.25 * 3) {
    // bubbleContentElement.innerHTML = bubbleValue;
    bubbleElement.classList.add("overflow");
  } else {
    bubbleValue = bubbleContentElement.innerHTML;
    bubbleElement.classList.remove("overflow");
  }
});

// Put the bubble text on the clipboard in MSYT format
exportBtnElement.addEventListener("mousedown", () => putMsytToClipboard(true));
document.addEventListener("keydown", (e) => {
  if (e.code == "Enter" && e.ctrlKey) putMsytToClipboard();
});

function updateBubbleType() {
  bubbleElement.classList.remove(bubbleType);
  bubbleType = bubbleTypeElement.value;
  bubbleElement.classList.add(bubbleType);
}

function sanitizePaste(e) {
  e.preventDefault();
  let plaintext = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, plaintext);
}

function sanitizeDrop(e) {
  e.preventDefault();
  let plaintext = e.dataTransfer.getData("text/plain");
  document.execCommand("insertText", false, plaintext);
}

function putMsytToClipboard(showShortcutHint) {
  if (!bubbleContentElement.textContent) {
    return window.alert("There's nothing to copy. Try typing some text in the dialogue bubble.");
  }
  if (bubbleElement.classList.contains("overflow")) {
    return window.alert("The text bubble is overflowing. Remove some text and try again.");
  }
  let msytExport = '  - text: "';
  let nodes = Array.from(bubbleContentElement.childNodes);
  for (let i = 0; i < nodes.length; i++) {
    let nodeContent = nodes[i].textContent;
    if (!nodeContent) nodes.splice(i, 1); // gets rid of empty nodes such as <br>
  }
  for (let i = 0; i < nodes.length; i++) {
    let nodeContent = breakTextAtWrap(nodes[i].textContent);
    if (nodeContent) {
      msytExport += nodeContent;
      if (i != nodes.length - 1) msytExport += "\\n";
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
}

function breakTextAtWrap(text) {
  let words = text.split(" ");
  let testString;
  let outputString;
  let output = [];
  while (words.length > 0) {
    testString = "";
    testBubbleText.textContent = "";
    while (testBubbleText.offsetHeight <= bubbleFontSize * 1.25) {
      outputString = testString;
      if (outputString) words.splice(0, 1);
      if (words.length == 0) break;
      testString += words[0];
      if (words.length > 1) testString += " ";
      testBubbleText.textContent = testString;
    }
    output += outputString;
    if (words.length > 0) {
      output = output.slice(0, -1);
      output += "\\n";
    }
  }
  return output;
}
