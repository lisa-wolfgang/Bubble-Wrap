import BubbleManager from "../scripts/BubbleManager.js";
import TestSuite from "./TestSuite.js";

const devMode = window.location.host == "127.0.0.1:3000";

BubbleManager.template = await fetch("components/bubble.html");
BubbleManager.template = await BubbleManager.template.text();
new BubbleManager();

// Allow bubbles to define their own drop behavior
document.addEventListener("drop", (e) => e.preventDefault());

// Do tests and post alert when in devmode
if (devMode) {
  let suite = new TestSuite();
  await document.fonts.ready; // don't run tests until all fonts have loaded
  suite.run();
  suite.printResults();
  suite.postResults();
}
