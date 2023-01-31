import BubbleManager from "../scripts/BubbleManager.js";
import Bubble from "./Bubble.js";
import MSYTParser from "./MSYTParser.js";

const devMode = window.location.host == "127.0.0.1:3000";

BubbleManager.template = await fetch("components/bubble.html");
BubbleManager.template = await BubbleManager.template.text();
new BubbleManager();

// Allow bubbles to define their own drop behavior
document.addEventListener("drop", (e) => e.preventDefault());

// Do tests and post alert when in devmode
if (devMode) {
  let passedTests = [];
  let failedTests = [];
  let testResult;
  BubbleManager.testBubbles.push(new Bubble(-1));

  // Test if single-line bubble = single-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a"') {
    pushTestPass("Single-line bubble to MSYT");
  } else {
    pushTestFail("Single-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if wrapping single-line bubble = multi-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "llamallamallamallamallamallamallamallamallama";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "llamallamallamallamallamallamallamallamal\\nlama"') {
    pushTestPass("Wrapping single-line bubble to MSYT");
  } else {
    pushTestFail("Wrapping single-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if manual two-line bubble = two-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>a<br></div>";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\na"') {
    pushTestPass("Manual two-line bubble to MSYT");
  } else {
    pushTestFail("Manual two-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if pasted two-line bubble = two-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a<br>a";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\na"') {
    pushTestPass("Pasted two-line bubble to MSYT");
  } else {
    pushTestFail("Pasted two-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if manual three-line bubble = three-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>a</div><div>a<br></div>";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\na\\na"') {
    pushTestPass("Manual three-line bubble to MSYT");
  } else {
    pushTestFail("Manual three-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if three-line bubble (one wrap, one manual) = three-line MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama"') {
    pushTestPass("Three-line bubble (one wrap, one manual) to MSYT");
  } else {
    pushTestFail("Three-line bubble (one wrap, one manual) to MSYT", `got result '${testResult}'`);
  }

  // Test control nodes
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = '<div><span data-color="red">aaaaaaa</span><span data-color="white">aaaaaa</span></div><div><span data-size="125">llamallamallamallam</span><span data-size="100">allamallamallamallamallama</span><br></div>';
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == "      - control:\n" + "          kind: set_colour\n" + "          colour: red\n" + '      - text: "aaaaaaa"\n' + "      - control:\n" + "          kind: reset_colour\n" + '      - text: "aaaaaa\\n"\n' + "      - control:\n" + "          kind: text_size\n" + "          percent: 125\n" + '      - text: "llamallamallamallam"\n' + "      - control:\n" + "          kind: text_size\n" + "          percent: 100\n" + '      - text: "allamallamallamal\\nlamallama"') {
    pushTestPass("Color/size control nodes");
  } else {
    pushTestFail("Color/size control nodes", `got result '${testResult}'`);
  }

  // Test if two bubbles = two-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles.push(new Bubble(-1, "a"));
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\n\\n\\na"') {
    pushTestPass("Two bubbles to MSYT");
  } else {
    pushTestFail("Two bubbles to MSYT", `got result '${testResult}'`);
  }

  // Test if three-line bubble (one wrap, one manual) + single-line bubble = two-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = "a";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama\\na"') {
    pushTestPass("Three-line bubble (one wrap, one manual) + single-line bubble to MSYT");
  } else {
    pushTestFail("Three-line bubble (one wrap, one manual) + single-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if three-line bubble (one wrap, one manual) + wrapping single-line bubble = two-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "<div>Hello, Link.</div><div>I have been awaiting your return for quite some time.<br></div>";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = '<div><span>Now I can finally avenge the </span><span data-color="grey"></span><span data-color="grey" data-size="80">embarrassing</span><span data-color="grey"></span><span> death of my master...</span></div>';
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "Hello, Link.\\nI have been awaiting your return for quite\\nsome time.\\nNow I can finally avenge the "\n      - control:\n          kind: set_colour\n          colour: grey\n      - control:\n          kind: text_size\n          percent: 80\n      - text: "embarrassing\\n"\n      - control:\n          kind: reset_colour\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "death of my master..."') {
    pushTestPass("Three-line bubble (one wrap, one manual) + wrapping single-line bubble to MSYT");
  } else {
    pushTestFail("Three-line bubble (one wrap, one manual) + wrapping single-line bubble to MSYT", `got result '${testResult}'`);
  }

  // Test if three bubbles = three-bubble MSYT node
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles.push(new Bubble(-1, "a"));
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\n\\n\\na\\n\\n\\na"') {
    pushTestPass("Three bubbles to MSYT");
  } else {
    pushTestFail("Three bubbles to MSYT", `got result '${testResult}'`);
  }

  // Test if the MSYT exporter skips over empty bubbles on export
  BubbleManager.testBubbles[0].bubbleContentElement.innerHTML = "a";
  BubbleManager.testBubbles[1].bubbleContentElement.innerHTML = "";
  BubbleManager.testBubbles[2].bubbleContentElement.innerHTML = "a";
  testResult = MSYTParser.export(BubbleManager.testBubbles);
  if (testResult == '      - text: "a\\n\\n\\na"') {
    pushTestPass("Skip empty bubbles on export");
  } else {
    pushTestFail("Skip empty bubbles on export", `got result '${testResult}'`);
  }

  // Post final test results
  let alertPopup = document.createElement("div");
  if (failedTests.length == 0) {
    console.groupCollapsed(`%c ✓ %c All tests passed`, "background-color: green; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
    alertPopup.textContent = "All tests passed.";
    alertPopup.classList.add("alertPopup", "alertPopup-testPass");
  } else {
    console.group(`%c ! %c ${failedTests.length} ${failedTests.length == 1 ? "test" : "tests"} failed`, "background-color: red; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
    alertPopup.textContent = `${failedTests.length} ${failedTests.length == 1 ? "test" : "tests"} failed. View console for details.`;
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
    console.log(`%c ✓ %c ${testName ? `"${testName}"` : "Test"} passed`, "background-color: green; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
  }

  function postTestFail(testName, msg) {
    console.log(`%c ! %c ${testName ? `"${testName}"` : "Test"} failed${msg ? `: ${msg}` : ""}`, "background-color: red; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
  }
}
