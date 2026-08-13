import BubbleManager from "./BubbleManager.js";
import Tests from "./enums/Tests.js";
import Test from "./Test.js";
import TestSubGroup from "./TestSubGroup.js";

/** A manager for all defined {@link Tests}. */
export default class TestSuite {
  subGroups = [new TestSubGroup("import", Test.prototype.tryImport), new TestSubGroup("export", Test.prototype.tryExport)];

  /**
   * Runs all available tests.
   */
  run() {
    // Store user-defined bubble type to re-apply later
    const userType = BubbleManager.type;
    BubbleManager.updateType("dialogue");
    // Run tests
    for (const testData of Tests) {
      const test = new Test(testData);
      for (const subGroup of this.subGroups) {
        const results = subGroup.func.call(test);
        for (const key in results) {
          const result = results[key];
          if (result.expected) {
            // Test failed
            subGroup.failedTests.push({
              inputDescription: result.inputDescription,
              outputDescription: result.outputDescription,
              format: key,
              result: result.result,
              expected: result.expected
            });
          } else {
            // Test passed
            subGroup.passedTests.push({
              inputDescription: result.inputDescription,
              outputDescription: result.outputDescription,
              format: key
            });
          }
        }
      }
    }
    // Re-apply user-defined bubble type
    BubbleManager.updateType(userType.className);
  }

  /** Shows a popup notification with the number of tests failed. */
  postResults() {
    let failTally = 0;
    for (const group of this.subGroups) {
      failTally += group.failedTests.length;
    }
    let alertPopup = document.createElement("div");
    if (failTally == 0) {
      alertPopup.textContent = "All tests passed.";
      alertPopup.classList.add("alertPopup", "alertPopup-testPass");
    } else {
      alertPopup.textContent = `${failTally} ${failTally == 1 ? "test" : "tests"} failed. View console for details.`;
      alertPopup.classList.add("alertPopup", "alertPopup-testFail");
    }
    document.body.appendChild(alertPopup);
  }

  /** Prints individual test results to the console. */
  printResults() {
    // Post failed tests
    for (const subGroup of this.subGroups) {
      if (subGroup.failedTests.length > 0) {
        this.startTestFailLogGroup(subGroup);
        subGroup.failedTests.forEach((e) => this.logTestFail(e));
        console.groupEnd();
      }
    }
    // Post passed tests
    for (const subGroup of this.subGroups) {
      this.startTestPassLogGroup(subGroup);
      subGroup.passedTests.forEach((e) => this.logTestPass(e));
      console.groupEnd();
    }
  }

  startTestPassLogGroup(group) {
    console.groupCollapsed(
      ...this.testPassToConsoleMsg(`${group.passedTests.length} ${group.type} ${group.passedTests.length == 1 ? "test" : "tests"} passed`)
    );
  }

  startTestFailLogGroup(group) {
    console.group(
      ...this.testFailToConsoleMsg(`${group.failedTests.length} ${group.type} ${group.failedTests.length == 1 ? "test" : "tests"} failed`)
    );
  }

  logTestPass(result) {
    const testName = `[${result.format}] ${result.inputDescription} → ${result.outputDescription.toLowerCase()}`;
    console.log(...this.testPassToConsoleMsg(testName));
  }

  logTestFail(result) {
    const testName = `[${result.format}] ${result.inputDescription} → ${result.outputDescription.toLowerCase()}`;
    console.groupCollapsed(...this.testFailToConsoleMsg(testName));
    console.log(`Test failed: got result:\n${result.result}\n\nThe expected result was:\n${result.expected}`);
    console.groupEnd();
  }

  testPassToConsoleMsg(msg) {
    return [
      `%c ✓ %c ${msg}`,
      "background-color: green; color: white; border-radius: 10px",
      "background-color: transparent; color: canvastext; border-radius: 0"
    ];
  }

  testFailToConsoleMsg(msg) {
    return [
      `%c ! %c ${msg}`,
      "background-color: red; color: white; border-radius: 10px",
      "background-color: transparent; color: canvastext; border-radius: 0"
    ];
  }
}
