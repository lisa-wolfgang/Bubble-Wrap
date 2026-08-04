import { load } from "./libs/js-yaml.esm.min.mjs";

import Parser, { BubbleToken } from "./Parser.js";

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

  // Import overrides

  createTokensFromPlaintext(plaintext) {
    // Fix first line's indentation before parsing
    if (!plaintext.startsWith("      ") && plaintext.includes("\n      ")) {
      while (!plaintext.startsWith("      ")) plaintext = " " + plaintext;
    }
    const tokens = [];
    const tokensData = load(plaintext);
    if (!(tokensData instanceof Array)) throw "Input is not YAML";
    for (const tokenData of tokensData) {
      if (tokenData.text) {
        tokens.push(new BubbleToken(tokenData.text, "newTextNode"));
      } else if (tokenData.control) {
        if (tokenData.control.kind == "set_colour" && ["grey", "red", "blue"].includes(tokenData.control.colour)) {
          // Set color
          tokens.push(new BubbleToken(tokenData.control.colour, "setTextAttr", "color"));
        } else if (tokenData.control.kind == "reset_colour") {
          // Reset color
          tokens.push(new BubbleToken(undefined, "setTextAttr", "color"));
        } else if (tokenData.control.kind == "text_size" && ["80", "125"].includes(tokenData.control.percent)) {
          // Set size
          tokens.push(new BubbleToken(tokenData.control.percent, "setTextAttr", "size"));
        } else if (tokenData.control.kind == "text_size" && tokenData.control.percent == 100) {
          // Reset size
          tokens.push(new BubbleToken(undefined, "setTextAttr", "size"));
        } else if (tokenData.control.kind == "pause") {
          // Add pause node
          let pauseVal;
          if (["short", "long", "longer"].includes(tokenData.control.length)) {
            pauseVal = tokenData.control.length;
          } else if (!isNaN(tokenData.control.frames)) {
            pauseVal = Number(tokenData.control.frames);
          }
          if (pauseVal !== undefined) {
            tokens.push(new BubbleToken(pauseVal, "newNonTextNode", "pause"));
          }
        } else if (tokenData.control.kind == "animation" && tokenData.control.name) {
          // Set bubble animation
          tokens.push(new BubbleToken(tokenData.control.name, "setBubbleAttr", "animation"));
        } else if (tokenData.control.kind == "sound") {
          const soundValues = tokenData.control.unknown;
          if (soundValues) {
            // Set preset animation (if valid)
            const presetAnimCount = PresetAnimation.OPTIONS.length;
            if (soundValues[1] == 0 && soundValues[0] < presetAnimCount * 2) {
              const presetAnimName = PresetAnimation.OPTIONS[soundValues[0] % presetAnimCount];
              tokens.push(new BubbleToken(presetAnimName, "setBubbleAttr", "animation"));
              if (soundValues[0] >= presetAnimCount) {
                tokens.push(new BubbleToken("animation", "setBubbleAttr", "sound"));
              }
            } else {
              // Otherwise set bubble sound generically
              tokens.push(new BubbleToken(soundValues.join(" "), "setBubbleAttr", "sound"));
            }
          }
        }
      }
    }
    return tokens;
  }

  // Export overrides

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
