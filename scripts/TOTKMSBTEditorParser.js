import Parser, { BubbleToken } from "./Parser.js";

import PresetAnimation from "./enums/PresetAnimation.js";

/** Extends {@link Parser} to use MSBT Editor's syntax for TOTK as the plaintext format. */
export default class TOTKMSBTEditorParser extends Parser {
  EMOTION_DICT = [
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

  /**
   * Exports a set of Bubbles into MSBT Editor syntax for TOTK.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported MSBT Editor syntax.
   */
  export(bubbles, verbose) {
    return super.export(bubbles, verbose);
  }

  // Import overrides

  createTokensFromPlaintext(plaintext) {
    // Remove entry name and attributes before parsing
    if (plaintext.split("\n")[0] === "---") {
      plaintext = plaintext.slice(4);
      while (plaintext.split("\n")[0] !== "---") {
        const nextLineIndex = plaintext.indexOf("\n") + 1;
        plaintext = plaintext.slice(nextLineIndex);
      }
      plaintext = plaintext.slice(4);
    }
    const tokens = [];
    const tokensData = this.parseTaggedText(plaintext, "{{", "}}", false);
    if (!this.testMode && tokensData.length <= 1) throw "Could not find text formatted with MSBT Editor control tag syntax";
    for (const tokenData of tokensData) {
      if (tokenData.textContent) {
        tokens.push(new BubbleToken(tokenData.textContent, "newTextNode"));
      } else {
        if (tokenData.nodeName == "color") {
          // Set color
          const colorId = tokenData.getAttribute("id");
          const convertedValue = { Orange: "red", Cyan: "blue", Gray: "grey" }[colorId];
          if (convertedValue) {
            tokens.push(new BubbleToken(convertedValue, "setTextAttr", "color"));
          } else if (colorId == "Default") {
            tokens.push(new BubbleToken(undefined, "setTextAttr", "color"));
          }
        } else if (tokenData.nodeName == "size") {
          // Set size
          const sizeVal = tokenData.getAttribute("value");
          if (["80", "125"].includes(sizeVal)) {
            tokens.push(new BubbleToken(sizeVal, "setTextAttr", "size"));
          } else if (sizeVal == "100") {
            tokens.push(new BubbleToken(undefined, "setTextAttr", "size"));
          }
        } else if (tokenData.nodeName == "delay8") {
          // Add pause node (short)
          tokens.push(new BubbleToken("short", "newNonTextNode", "pause"));
        } else if (tokenData.nodeName == "delay15") {
          // Add pause node (long)
          tokens.push(new BubbleToken("long", "newNonTextNode", "pause"));
        } else if (tokenData.nodeName == "delay30") {
          // Add pause node (longer)
          tokens.push(new BubbleToken("longer", "newNonTextNode", "pause"));
        } else if (tokenData.nodeName == "delay") {
          // Add pause node (custom frame count)
          const frameVal = tokenData.getAttribute("frames");
          tokens.push(new BubbleToken(frameVal, "newNonTextNode", "pause"));
        } else if (tokenData.nodeName == "setVoice") {
          // Set bubble animation
          const animVal = tokenData.getAttribute("asset");
          tokens.push(new BubbleToken(animVal, "setBubbleAttr", "animation"));
        } else if (tokenData.nodeName == "playSound") {
          // Set bubble sound (custom)
          const soundVal = tokenData.getAttribute("id");
          tokens.push(new BubbleToken(soundVal, "setBubbleAttr", "sound"));
        } else if (tokenData.nodeName == "setEmotion") {
          // Set bubble animation/sound preset (if valid)
          const presetVal = tokenData.getAttribute("emotion");
          const presetIndex = this.EMOTION_DICT.indexOf(presetVal) - 7;
          if (presetIndex < 0 || presetIndex >= PresetAnimation.OPTIONS.length) continue;
          const convertedValue = PresetAnimation.OPTIONS[presetIndex];
          tokens.push(new BubbleToken(convertedValue, "setBubbleAttr", "animation"));
          const noVoice = tokenData.getAttribute("noVoice");
          if (noVoice == "false") tokens.push(new BubbleToken("animation", "setBubbleAttr", "sound"));
        }
      }
    }
    return tokens;
  }

  // Export overrides

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
    const emotion = this.EMOTION_DICT[animationValue + 7]; // TODO: Add support for "serious" and face-only
    let noVoice = "true";
    if (bubble.sound == "animation") noVoice = "false";
    this.plaintextExport += `{{setEmotion emotion="${emotion}" noVoice="${noVoice}"}}`;
  }

  addAnimationNode(animation) {
    this.plaintextExport += `{{setVoice asset="${animation}"}}`;
  }

  addSoundNode(sound) {
    this.plaintextExport += `{{playSound id="${sound}"}}`;
  }

  addPauseNode(duration) {
    if (isNaN(duration)) {
      if (duration == "short") duration = 8;
      else if (duration == "long") duration = 15;
      else if (duration == "longer") duration = 30;
      this.plaintextExport += `{{delay${duration}}}`;
    } else {
      this.plaintextExport += `{{delay frames="${duration}"}}`;
    }
  }

  addColorNode(color) {
    // TODO: Support 3 in popup text, 4 in credits
    if (color == "red") color = "Orange";
    else if (color == "blue") color = "Cyan";
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
