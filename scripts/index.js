import BubbleManager from "../scripts/BubbleManager.js";
import Bubble from "./Bubble.js";
import MSYTParser from "./MSYTParser.js";

let devMode = window.location.host == "127.0.0.1:5500";

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

// Do tests and post alert when in devmode
if (devMode) {
  let passedTests = [];
  let failedTests = [];
  BubbleManager.testBubbles.push(new Bubble(-1));

  // Test if empty bubble = empty MSYT node
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: ""') {
    pushTestPass("Empty bubble to MSYT");
  } else {
    pushTestFail("Empty bubble to MSYT");
  }

  // Test if single-line bubble = single-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a"') {
    pushTestPass("Single-line bubble to MSYT");
  } else {
    pushTestFail("Single-line bubble to MSYT");
  }

  // Test if wrapping single-line bubble = multi-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"') {
    pushTestPass("Wrapping single-line bubble to MSYT");
  } else {
    pushTestFail("Wrapping single-line bubble to MSYT");
  }

  // Test if manual two-line bubble = two-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>a<br></div>";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\na"') {
    pushTestPass("Manual two-line bubble to MSYT");
  } else {
    pushTestFail("Manual two-line bubble to MSYT");
  }

  // Test if pasted two-line bubble = two-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a<br>a";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\na"') {
    pushTestPass("Pasted two-line bubble to MSYT");
  } else {
    pushTestFail("Pasted two-line bubble to MSYT");
  }

  // Test if three-line bubble = three-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>a</div><div>a<br></div>";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\na\\na"') {
    pushTestPass("Three-line bubble to MSYT");
  } else {
    pushTestFail("Three-line bubble to MSYT");
  }

  // Test if three-line bubble (one wrap, one manual) = three-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa<br></div>";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"') {
    pushTestPass("Three-line bubble (one wrap, one manual) to MSYT");
  } else {
    pushTestFail("Three-line bubble (one wrap, one manual) to MSYT");
  }

  // Test if two bubbles = two-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles.push(new Bubble(-1, "a"));
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\n\\n\\na"') {
    pushTestPass("Two bubbles to MSYT");
  } else {
    pushTestFail("Two bubbles to MSYT");
  }

  // Test if three-line bubble (one wrap, one manual) + single-line bubble = two-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa<br></div>";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = "a";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\\na"') {
    pushTestPass("Three-line bubble (one wrap, one manual) + single-line bubble to MSYT");
  } else {
    pushTestFail("Three-line bubble (one wrap, one manual) + single-line bubble to MSYT");
  }

  // Test if three bubbles = three-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles.push(new Bubble(-1, "a"));
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\n\\n\\na\\n\\n\\na"') {
    pushTestPass("Three bubbles to MSYT");
  } else {
    pushTestFail("Three bubbles to MSYT");
  }

  // Test if the MSYT exporter skips over empty bubbles on export
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = "";
  BubbleManager.testBubbles[2].bubbleContentElement.innerHTML = "a";
  if (MSYTParser.export(BubbleManager.testBubbles) == '  - text: "a\\n\\n\\na"') {
    pushTestPass("Skip empty bubbles on export");
  } else {
    pushTestFail("Skip empty bubbles on export");
  }

  // Post final test results
  let alertPopup = document.createElement("div");
  if (failedTests.length == 0) {
    console.groupCollapsed(`%c ✓ %c All tests passed`, "background-color: green; color: white; border-radius: 10px");
    alertPopup.textContent = "All tests passed.";
    alertPopup.classList.add("alertPopup", "alertPopup-testPass");
  } else {
    console.group(`%c ! %c ${failedTests.length} ${failedTests.length == 1 ? "test" : "tests"} failed`, "background-color: red; color: white; border-radius: 10px");
    alertPopup.textContent = `${failedTests.length} tests failed. View console for details.`;
    alertPopup.classList.add("alertPopup", "alertPopup-testFail");
    failedTests.forEach((e) => {
      postTestFail(e.testName, e.msg);
    });
  }
  passedTests.forEach((e) => {
    postTestPass(e.testName);
  });
  console.groupEnd();
  document.body.appendChild(alertPopup);

  function pushTestPass(testName) {
    passedTests.push({ testName: testName });
  }

  function pushTestFail(testName, msg) {
    failedTests.push({ testName: testName, msg: msg });
  }

  function postTestPass(testName) {
    console.log(`%c ✓ %c ${testName ? `"${testName}"` : "Test"} passed`, "background-color: green; color: white; border-radius: 10px");
  }

  function postTestFail(testName, msg) {
    console.log(`%c ! %c ${testName ? `"${testName}"` : "Test"} failed${msg ? `: ${msg}` : ""}`, "background-color: red; color: white; border-radius: 10px");
  }
}

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
