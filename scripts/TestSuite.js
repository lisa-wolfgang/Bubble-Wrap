import Tests from "./enums/Tests.js";
import Test from "./Test.js";

/** A manager for all defined {@link Tests}. */
export default class TestSuite {
  /**
   * Creates a new TestSuite.
   */
  constructor() {
    this.passedTests = [];
    this.failedTests = [];
  }

  /**
   * Runs all available tests.
   */
  run() {
    for (const test of Tests) {
      const results = new Test(test.bubbles, test.outputs).evaluate();
      for (const result of results) {
        if (result != null) {
          // Test failed
          this.failedTests.push({
            inputDescription: test.inputDescription,
            outputDescription: test.outputDescription,
            result: result.result,
            expected: result.expected
          });
        } else {
          // Test passed
          this.passedTests.push({
            inputDescription: test.inputDescription,
            outputDescription: test.outputDescription
          });
        }
      }
    }
  }

  /** Shows a popup notification with the number of tests failed. */
  postResults() {
    let alertPopup = document.createElement("div");
    if (this.failedTests.length == 0) {
      alertPopup.textContent = "All tests passed.";
      alertPopup.classList.add("alertPopup", "alertPopup-testPass");
    } else {
      alertPopup.textContent = `${this.failedTests.length} ${this.failedTests.length == 1 ? "test" : "tests"} failed. View console for details.`;
      alertPopup.classList.add("alertPopup", "alertPopup-testFail");
    }
    document.body.appendChild(alertPopup);
  }

  /** Prints individual test results to the console. */
  printResults() {
    if (this.failedTests.length == 0) {
      console.groupCollapsed(`%c ✓ %c All tests passed`, "background-color: green; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
    } else {
      console.group(`%c ! %c ${this.failedTests.length} ${this.failedTests.length == 1 ? "test" : "tests"} failed`, "background-color: red; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
      this.failedTests.forEach((e) => {
        this.logTestFail(e);
      });
    }
    this.passedTests.forEach((e) => {
      this.logTestPass(e);
    });
    console.groupEnd();
  }

  logTestPass(result) {
    const testName = `${result.inputDescription} → ${result.outputDescription.toLowerCase()}`;
    console.log(`%c ✓ %c ${testName}`, "background-color: green; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
  }

  logTestFail(result) {
    const testName = `${result.inputDescription} → ${result.outputDescription.toLowerCase()}`;
    console.groupCollapsed(`%c ! %c ${testName}`, "background-color: red; color: white; border-radius: 10px", "background-color: transparent; color: canvastext; border-radius: 0");
    console.log(`Test failed: got result:\n${result.result}\n\nThe expected result was:\n${result.expected}`);
    console.groupEnd();
  }
}
