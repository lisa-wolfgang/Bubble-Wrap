import Parser from "./Parser.js";

import PresetAnimation from "./enums/PresetAnimation.js";

/** Extends {@link Parser} to use MSYT as the plaintext format. */
export default class MSYTParser extends Parser {
  /**
   * Exports a set of Bubbles into MSYT text.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported MSYT text.
   */
  export(bubbles, verbose) {
    return super.export(bubbles, verbose);
  }

  startTextNode() {
    this.plaintextExport += `      - text: "`;
  }

  addLineBreak() {
    this.plaintextExport += `\\n`;
  }

  endTextNode(isFinal) {
    this.plaintextExport += '"';
    if (!isFinal) {
      this.plaintextExport += "\n";
    }
  }

  addPresetAnimNode(bubble) {
    const animationValue = PresetAnimation.OPTIONS.indexOf(bubble.animation);
    const soundValue = bubble.sound == "animation" ? animationValue + 6 : animationValue;
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: sound\n`;
    this.plaintextExport += `          unknown:\n`;
    this.plaintextExport += `            - ${soundValue}\n`;
    this.plaintextExport += `            - 0\n`;
  }

  addAnimationNode(animation) {
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: animation\n`;
    this.plaintextExport += `          name: ${animation}\n`;
  }

  addSoundNode(sound) {
    const soundArray = sound.split(" ");
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: sound\n`;
    this.plaintextExport += `          unknown:\n`;
    this.plaintextExport += `            - ${soundArray[0]}\n`;
    this.plaintextExport += `            - ${soundArray[1]}\n`;
  }

  addPauseNode(duration) {
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: pause\n`;
    this.plaintextExport += `          ${isNaN(duration) ? "length" : "frames"}: ${duration}\n`;
  }

  addColorNode(color) {
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: set_colour\n`;
    this.plaintextExport += `          colour: ${color}\n`;
  }

  addResetColorNode() {
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: reset_colour\n`;
  }

  addSizeNode(size) {
    this.plaintextExport += `      - control:\n`;
    this.plaintextExport += `          kind: text_size\n`;
    this.plaintextExport += `          percent: ${size}\n`;
  }

  postProcess(output) {
    return output.trimEnd();
  }
}
