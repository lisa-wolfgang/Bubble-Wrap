import Parser from "./Parser.js";

import PresetAnimation from "./enums/PresetAnimation.js";

/** Extends {@link Parser} to use MSBT Editor's syntax for TOTK as the plaintext format. */
export default class TOTKMSBTEditorParser extends Parser {
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
    const emotionDict = [
      "Normal_Face",
      "Pleasure_Face",
      "Anger_Face",
      "Sorrow_Face",
      "Surprise_Face",
      "Thinking_Face",
      "Serious_Face",
      "Normal",
      "Pleasure",
      "Angry",
      "Sorrow",
      "Surprise",
      "Thinking",
      "Serious"
    ];
    const emotion = emotionDict[animationValue + 7]; // TODO: Add support for "serious" and face-only
    let noVoice = "true";
    if (bubble.sound == "animation") noVoice = "false";
    this.plaintextExport += `{{setEmotion emotion="${emotion}" noVoice="${noVoice}"}}`;
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
    if (color == "red") color = "Orange"; // 3 in popup text
    else if (color == "blue") color = "Cyan"; // 4 in credits
    else if (color == "grey") color = "Gray";
    else return this.addResetColorNode();
    this.plaintextExport += `{{color id="${color}"}}`;
  }

  addResetColorNode() {
    this.plaintextExport += `{{color id="Default"}}`;
  }

  addSizeNode(size) {
    this.plaintextExport += `{{size value="${size}"}}`;
  }
}
