import Parser from "./Parser.js";

import PresetAnimation from "./enums/PresetAnimation.js";

/** Extends {@link Parser} to use MSBT Editor's syntax for TOTK as the plaintext format. */
export default class TOTKMBSTEditorParser extends Parser {
  /**
   * Exports a set of Bubbles into MSBT Editor syntax for TOTK.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported MSBT Editor syntax.
   */
  export(bubbles, verbose) {
    return super.export(bubbles, verbose);
  }

  /** This function is unneeded for MSBT Editor's syntax. */
  startTextNode() {}

  addLineBreak() {
    this.plaintextExport += `\n`;
  }

  /** This function is unneeded for MSBT Editor's syntax. */
  endTextNode(isFinal) {}

  addPresetAnimNode(bubble) {
    // Mappings discovered by @Qw2#8979 and @dt12345#0389 on Discord
    const animationValue = PresetAnimation.OPTIONS.indexOf(bubble.animation);
    let soundValue = animationValue;
    if (bubble.sound == "animation") soundValue += animationValue + 7; // TODO: Add support for "serious"
    soundValue = soundValue.toString(16); // convert to hex
    this.plaintextExport += `{{resetAnim arg="[${soundValue},1]"}}`;
  }

  addAnimationNode(animation) {
    this.plaintextExport += `{{anim type="${animation}"}}`;
  }

  addSoundNode(sound) {
    this.plaintextExport += `{{playSound id="${sound}"}}`;
  }

  addPauseNode(duration) {
    if (isNaN(duration)) {
      if (duration == "short") duration = 1;
      else if (duration == "long") duration = 2;
      else if (duration == "longer") duration = 3;
      this.plaintextExport += `{{delay${duration}}}`;
    } else {
      this.plaintextExport += `{{delay frames="${duration}"}}`;
    }
  }

  addColorNode(color) {
    if (color == "red") color = 0; // 3 in popup text
    else if (color == "blue") color = 1; // 4 in credits
    else if (color == "grey") color = 2;
    else return this.addResetColorNode();
    this.plaintextExport += `{{color id="${color}"}}`;
  }

  addResetColorNode() {
    this.plaintextExport += `{{color id="65535"}}`;
  }

  addSizeNode(size) {
    this.plaintextExport += `{{size value="${size}"}}`;
  }
}
