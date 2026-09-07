import Parser, { BubbleToken } from "./Parser.js";

import PresetAnimation from "./enums/PresetAnimation.js";

/** Extends {@link Parser} to use NX Editor's syntax for TOTK as the plaintext format. */
export default class TOTKNXEditorParser extends Parser {
  // Import overrides

  createTokensFromPlaintext(plaintext) {
    // Remove entry name before parsing
    let wasFullEntry = false;
    if (plaintext.split("\n")[0].trim().endsWith("|")) {
      wasFullEntry = true;
      const nextLineIndex = plaintext.indexOf("\n") + 1;
      plaintext = plaintext.slice(nextLineIndex);
    }
    // Unindent before parsing
    if (plaintext.startsWith("  ") && (plaintext.includes("\n  ") || wasFullEntry || this.testMode)) {
      plaintext = plaintext.slice(2).replaceAll("\n  ", "\n");
    }
    const tokens = [];
    const tokensData = this.parseTaggedText(plaintext, "<", "/>");
    if (!this.testMode && tokensData.length <= 1) throw "Could not find text formatted with NX Editor control tag syntax";
    for (const tokenData of tokensData) {
      if (tokenData.textContent) {
        tokens.push(new BubbleToken(tokenData.textContent, "newTextNode"));
      } else {
        const controlType = tokenData.getAttribute("Type");
        const controlValue = tokenData.getAttribute("Data");
        if (tokenData.nodeName == "control-0" && controlType == "3") {
          // Set color
          const convertedValue = ["red", "blue", "grey"][this.getHexByte(controlValue)];
          if (convertedValue) {
            tokens.push(new BubbleToken(convertedValue, "setTextAttr", "color"));
          } else if (controlValue == "ffff") {
            tokens.push(new BubbleToken(undefined, "setTextAttr", "color"));
          }
        } else if (tokenData.nodeName == "control-0" && controlType == "2") {
          // Set size
          const convertedValue = this.getHexByte(controlValue);
          if ([80, 125].includes(convertedValue)) {
            tokens.push(new BubbleToken(convertedValue, "setTextAttr", "size"));
          } else if (convertedValue == 100) {
            tokens.push(new BubbleToken(undefined, "setTextAttr", "size"));
          }
        } else if (tokenData.nodeName == "control-5") {
          // Add pause node
          if (parseInt(controlType) <= 2) {
            const convertedValue = ["short", "long", "longer"][parseInt(controlType)];
            tokens.push(new BubbleToken(convertedValue, "newNonTextNode", "pause"));
          }
        } else if (tokenData.nodeName == "control-1" && controlType == "0") {
          // Add pause node (custom frame count)
          const convertedValue = this.getHexByte(controlValue);
          tokens.push(new BubbleToken(convertedValue, "newNonTextNode", "pause"));
        } else if (tokenData.nodeName == "control-4" && controlType == "0") {
          // Set bubble animation
          const convertedValue = this.getCharsFromHex(controlValue);
          tokens.push(new BubbleToken(convertedValue, "setBubbleAttr", "animation"));
        } else if (tokenData.nodeName == "control-1" && controlType == "3") {
          // Set bubble sound (custom)
          const convertedValue = this.getHexByte(controlValue);
          tokens.push(new BubbleToken(convertedValue, "setBubbleAttr", "sound"));
        } else if (tokenData.nodeName == "control-3" && controlType == "0") {
          // Set bubble animation/sound preset (if valid)
          const presetIndex = this.getHexByte(controlValue) - 7;
          if (presetIndex < 0 || presetIndex >= PresetAnimation.OPTIONS.length) continue;
          const convertedValue = PresetAnimation.OPTIONS[presetIndex];
          tokens.push(new BubbleToken(convertedValue, "setBubbleAttr", "animation"));
          const noVoice = this.getHexByte(controlValue.slice(2));
          if (noVoice == 0) tokens.push(new BubbleToken("animation", "setBubbleAttr", "sound"));
        } else {
          // Unsupported node
          const jsonData = {
            group: tokenData.nodeName,
            type: controlType,
            argData: controlValue
          };
          tokens.push(new BubbleToken(JSON.stringify(jsonData), "newNonTextNode", undefined));
        }
      }
    }
    return tokens;
  }

  getHexByte(value) {
    return parseInt(value.slice(0, 2), 16);
  }

  getCharsFromHex(value) {
    let result = "";
    for (let i = 4; i < value.length; i += 4) {
      const byteVal = this.getHexByte(value.slice(i));
      result += String.fromCharCode(byteVal);
    }
    return result;
  }

  // Export overrides

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
    let soundValue = animationValue + 7; // TODO: Add support for "serious"
    soundValue = soundValue.toString(16); // convert to hex
    let noVoice = 1;
    if (bubble.sound == "animation") noVoice = 0;
    this.plaintextExport += `<3 Type='0' Data='0${soundValue}0${noVoice}'/>`;
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
    // TODO: Support 3 in popup text, 4 in credits
    if (color == "red") color = 0;
    else if (color == "blue") color = 1;
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

  addUnsupportedNode(data) {
    const nodes = data.split("\n").map((nodeData) => JSON.parse(nodeData));
    for (const node of nodes) {
      this.plaintextExport += `<${node.group.replace("control-", "")} Type='${node.type}' Data='${node.argData}'/>`;
    }
  }

  postProcess(output) {
    return "  " + output;
  }
}
