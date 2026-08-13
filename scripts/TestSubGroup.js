import Test from "./Test.js";

/** Stores information about a group of related sub-tests. */
export default class TestSubGroup {
  /**
   * Creates a new TestGroup.
   * @param {string} type A descriptor for the sub-tests in this group.
   * @param {function} func The {@link Test} function to execute for this group.
   */
  constructor(type, func) {
    this.type = type;
    this.func = func;
    this.passedTests = [];
    this.failedTests = [];
  }
}
