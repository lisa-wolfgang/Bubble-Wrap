import Parser from "./Parser.js";

import PresetAnimation from "./enums/PresetAnimation.js";

/** Extends {@link Parser} to use NX Editor's syntax for TOTK as the plaintext format. */
export default class TOTKNXEditorParser extends Parser {
  /**
   * Exports a set of Bubbles into NX Editor syntax for TOTK.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported NX Editor syntax.
   */
  export(bubbles, verbose) {
    return "  " + super.export(bubbles, verbose);
  }

  /** This function is unneeded for NX Editor's syntax. */
  startTextNode() {}

  addLineBreak() {
    this.plaintextExport += `\n  `;
  }

  /** This function is unneeded for NX Editor's syntax. */
  endTextNode(isFinal) {}

  addPresetAnimNode(bubble) {
    // Mappings discovered by @Qw2#8979 and @dt12345#0389 on Discord
    const animationValue = PresetAnimation.OPTIONS.indexOf(bubble.animation);
    let soundValue = animationValue;
    if (bubble.sound == "animation") soundValue += animationValue + 7; // TODO: Add support for "serious"
    soundValue = soundValue.toString(16); // convert to hex
    this.plaintextExport += `<3 Type='0' Data='0${soundValue}01'/>`;
  }

  addAnimationNode(animation) {
    // First byte contains the animation name's size in bytes (second byte is zero-padding)
    let animationHex = (animation.length * 2).toString(16).padStart(2, "0") + "00";
    // Remaining bytes are character codes with zero-padding (2 bytes per char)
    for (let i = 0; i < animation.length; i++) {
      animationHex += animation.charCodeAt(i).toString(16).padStart(2, "0") + "00";
    }
    this.plaintextExport += `<4 Type='0' Data='${animationHex}'/>`;
  }

  addSoundNode(sound) {
    this.plaintextExport += `<1 Type='3' Data='${parseInt(sound).toString(16).padStart(2, "0")}00'/>`;
  }

  addPauseNode(duration) {
    if (isNaN(duration)) {
      if (duration == "short") duration = 0;
      else if (duration == "long") duration = 1;
      else if (duration == "longer") duration = 2;
      this.plaintextExport += `<5 Type='${duration}'/>`;
    } else {
      this.plaintextExport += `<1 Type='0' Data='${parseInt(duration).toString(16).padStart(2, "0")}00'/>`;
    }
  }

  addColorNode(color) {
    if (color == "red") color = 0; // 3 in popup text
    else if (color == "blue") color = 1; // 4 in credits
    else if (color == "grey") color = 2;
    else return this.addResetColorNode();
    this.plaintextExport += `<0 Type='3' Data='0${color}00'/>`;
  }

  addResetColorNode() {
    this.plaintextExport += `<0 Type='3' Data='ffff'/>`;
  }

  addSizeNode(size) {
    this.plaintextExport += `<0 Type='2' Data='${parseInt(size).toString(16).padStart(2, "0")}00'/>`;
  }
}
