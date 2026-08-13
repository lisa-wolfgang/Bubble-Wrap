import Bubble from "./Bubble.js";
import BubbleManager from "./BubbleManager.js";
import BubbleTester from "./BubbleTester.js";
import BubbleUtil from "./BubbleUtil.js";

import TextColor from "./enums/TextColor.js";
import TextSize from "./enums/TextSize.js";
import PauseDuration from "./enums/PauseDuration.js";
import PresetAnimation from "./enums/PresetAnimation.js";

/** A base class for converting between Bubble Wrap data and plaintext formats. */
export default class Parser {
  /** Creates a new {@link Parser}. */
  constructor(testMode = false) {
    if (this.constructor == Parser) {
      throw new Error("`Parser` should not be instantiated directly. Use a subclass that is written to export in a specific format.");
    }
    this.testMode = testMode;
    this.plaintextExport = "";
  }

  static filter(plaintext) {
    // Convert certain characters to the variants used in-game
    let replaceDict = {
      "\\n": "\n",
      "\\\\n": "\n",
      '\\"': '"',
      "--": "—",
      "‘": "'",
      "’": "'",
      "“": '"',
      "”": '"',
      "…": "..."
    };
    for (const [key, val] of Object.entries(replaceDict)) {
      plaintext = plaintext.replaceAll(key, val);
    }
    return plaintext;
  }

  /**
   * Determines whether or not the input string ends in sentence-ending punctuation,
   * accounting for quotation marks and parantheses.
   * @param {string} line The string to test.
   * @returns {boolean} Whether or not `line` is punctuated.
   */
  static lineIsPunctuated(line) {
    let punctuation = [".", "?", "!"];
    let exceptionEndings = ['"', "»", "«", "›", "‹", ")"];
    return punctuation.some(
      (p) =>
        line.endsWith(p) ||
        exceptionEndings.some(
          (x) =>
            line.endsWith(x) &&
            (line.endsWith(p, line.length - 1) ||
              exceptionEndings.some((x2) => line.endsWith(x2, line.length - 1) && line.endsWith(p, line.length - 2)))
        )
    );
  }

  /**
   * Appends the input text to the current chain in bubble form.
   * @param {string} plaintext The text to be appended.
   * @param {Bubble} parent The bubble to append the text to.
   */
  static appendAsBubbles(plaintext, parent) {
    let plaintextChunks = Parser.filter(plaintext).split("\n");
    let textLines = [];
    plaintextChunks.forEach((chunk) => {
      textLines = textLines.concat(BubbleTester.breakTextAtWrap(chunk));
    });
    let bubbleStartIndex = 0;
    let bubbleManagerIndex = BubbleManager.bubbles.indexOf(parent);
    let lineIndex;
    let setTextChunkToOffset = setTextChunkToOffsetFunc.bind(parent);
    for (lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
      let line = textLines[lineIndex];
      let nextLine = textLines[lineIndex + 1];
      let nextNextLine = textLines[lineIndex + 2];
      let relativeLineIndex = lineIndex - bubbleStartIndex;
      if (Parser.lineIsPunctuated(line) && line != "") {
        let isEndingLastLine = relativeLineIndex >= 2;
        let isEndingSecondLine = relativeLineIndex == 1 && nextLine != undefined && !Parser.lineIsPunctuated(nextLine);
        let isEndingFirstLine =
          relativeLineIndex == 0 &&
          nextLine != undefined &&
          !Parser.lineIsPunctuated(nextLine) &&
          nextNextLine != undefined &&
          !Parser.lineIsPunctuated(nextNextLine);
        if (isEndingLastLine || isEndingSecondLine || isEndingFirstLine || !nextLine || nextLine == "") {
          setTextChunkToOffset();
        }
      } else if (line == "") {
        while (textLines[lineIndex] == "") {
          textLines.splice(lineIndex, 1);
        }
        if (relativeLineIndex > 0) setTextChunkToOffset();
        else lineIndex--;
      } else if (lineIndex == textLines.length - 1) {
        setTextChunkToOffset();
      }
    }
    if (plaintext) document.execCommand("insertText", false, plaintext);

    function setTextChunkToOffsetFunc() {
      let textChunk = textLines.slice(bubbleStartIndex, lineIndex + 1).join("\n");
      if (bubbleStartIndex > 0 && !BubbleManager.type.isSingleton) {
        BubbleManager.addBubble(BubbleManager.bubbles[bubbleManagerIndex], textChunk);
        bubbleManagerIndex++;
      } else {
        document.execCommand("insertText", false, textChunk);
        plaintext = null;
      }
      bubbleStartIndex = lineIndex + 1;
    }
  }

  /**
   * Imports plaintext as a set of Bubbles.
   * @param {string} text The plaintext to import.
   * @returns {boolean} Whether the import was successful.
   */
  import(text) {
    // Attempt to process plaintext
    let tokens;
    try {
      tokens = this.createTokensFromPlaintext(text);
    } catch (error) {
      console.log(`Could not import text with ${this.constructor.name}: ${error}`);
      return false;
    }
    // Populate new bubbles
    this.executeTokensOnChain(tokens);
    return true;
  }

  /**
   * Parses plaintext containing control tag syntax into an equivalent DOM format.
   * @param {string} plaintext The plaintext to import.
   * @param {string} tagStart The syntax that denotes an opening tag.
   * @param {string} tagEnd The syntax that denotes a closing tag.
   * @param {boolean} handleIllegalTagNames Whether tag names should be prefixed with "control-".
   * @returns {NodeList}
   */
  parseTaggedText(plaintext, tagStart, tagEnd, handleIllegalTagNames = true) {
    // Make content parsable by DOMParser
    let xmlLike = plaintext.replaceAll(tagStart, handleIllegalTagNames ? "<control-" : "<");
    xmlLike = xmlLike.replaceAll(tagEnd, "/>");
    xmlLike = "<root>" + xmlLike + "</root>";

    const domObj = new DOMParser().parseFromString(xmlLike, "application/xml").firstChild;
    return domObj?.childNodes || new NodeList();
  }

  /**
   * Creates new bubbles using the provided tokens.
   * @param {BubbleToken[]} tokens
   */
  executeTokensOnChain(tokens) {
    // Start inserting at/after selected bubble
    let currentBubble;
    if (!this.testMode) {
      let range = getSelection()?.getRangeAt(0);
      if (range) currentBubble = BubbleManager.getBubbleFromNode(range.endContainer);
      else currentBubble = BubbleManager.bubbles.at(-1);
    }
    if (this.testMode || currentBubble.lineCount > 1 || currentBubble.bubbleContentElement.firstChild?.hasChildNodes()) {
      currentBubble = this.addBubble(currentBubble);
    }

    let lineCount = 1;
    let createNewLine = false;
    let thisLineContent = "";
    let emptyLines = 0;
    const currentTextAttrs = {
      color: undefined,
      size: undefined
    };
    for (const token of tokens) {
      if (token.instruction === "newTextNode") {
        // Fill new bubbles without compensating for line wrapping
        const textFragments = Parser.filter(token.value);
        textFragments.split("\n").forEach((textFragment, isLineBreak) => {
          if (isLineBreak) {
            lineCount++;
            createNewLine = true;
            if (thisLineContent === "") emptyLines++;
            thisLineContent = "";
          }
          thisLineContent += textFragment;
          if (createNewLine && (!currentBubble || lineCount > BubbleManager.type.lineCount)) {
            currentBubble = this.addBubble(currentBubble);
            lineCount = 1;
            createNewLine = false; // new line is created with new bubble
            emptyLines = 0;
          }
          const textArgs = Object.assign({}, currentTextAttrs); // make unique copy
          if (thisLineContent !== "") {
            while (emptyLines > 0) {
              currentBubble.insertTextNode(new Text(), undefined, !createNewLine);
              emptyLines--;
            }
            currentBubble.insertTextNode(new Text(textFragment), textArgs, !createNewLine);
            createNewLine = false;
            emptyLines = 0;
          }
        });
      } else if (token.instruction === "newNonTextNode") {
        if (token.type === "pause") {
          currentBubble.insertPauseNode(token.value);
        }
      } else if (token.instruction === "setTextAttr") {
        // Set given property of next text token
        currentTextAttrs[token.type] = token.value;
      } else if (token.instruction === "setBubbleAttr") {
        if (token.type === "animation") {
          currentBubble.animation = token.value;
        } else if (token.type === "sound") {
          currentBubble.sound = token.value;
        }
      }
    }
  }

  addBubble(parentBubble) {
    if (this.testMode) {
      const testBubble = new Bubble(-1);
      BubbleManager.testBubbles.push(testBubble);
      return testBubble;
    } else {
      return BubbleManager.addBubble(parentBubble);
    }
  }

  /**
   * Exports a set of Bubbles into plaintext.
   * @param {Bubble[]} bubbles An array of Bubble objects.
   * @param {boolean} verbose Whether or not the browser should warn the user about issues.
   * @returns A string containing the exported plaintext.
   */
  export(bubbles, verbose) {
    this.plaintextExport = "";

    let lineCount = 1;
    let currentColor = TextColor.DEFAULT;
    let currentSize = TextSize.DEFAULT;
    let previousColor, previousSize;
    let textUnfinished = false;
    for (let b = 0; b < bubbles.length; b++) {
      let originalLineCount = lineCount;
      let bubble = bubbles[b];
      if (verbose && bubbles.length == 1 && !bubble.bubbleContentElement.textContent) {
        window.alert("There's nothing to copy. Try typing some text in the dialogue bubble.");
        return undefined;
      }
      if (verbose && bubble.element.classList.contains("overflow")) {
        window.alert(
          "Your text is overflowing. The red bubbles indicate bubbles with too many lines or too many characters. Reformat your text, and try again."
        );
        return undefined;
      }

      // Bubble property control nodes (animation, sound)
      if (bubble.animation != "none" || bubble.sound != "none") {
        if (textUnfinished) {
          this.endTextNode(false);
          textUnfinished = false;
        }
        if (bubble.animation != "none") {
          if (PresetAnimation.OPTIONS.includes(bubble.animation)) {
            // Preset animation/sound
            this.addPresetAnimNode(bubble);
          } else {
            // Custom animation name
            this.addAnimationNode(bubble.animation);
          }
        }
        if (bubble.sound != "none" && bubble.sound != "animation") {
          // Custom sound value
          this.addSoundNode(bubble.sound);
        }
      }

      // Text and inline control nodes
      let nodes = BubbleTester.breakNodesAtWrap(bubble);
      let text;
      for (let line = 0; line < nodes.length; line++) {
        for (let n = 0; n < nodes[line].length; n++) {
          let node = nodes[line][n];
          if (!node.nodeValue && !node.childNodes[0] && !node.getAttribute?.("data-pause")) continue;
          let isFirst = !previousColor;

          // If this is a pause node, parse and continue to next node
          let pauseDuration = node.getAttribute?.("data-pause");
          if (pauseDuration) {
            if (textUnfinished) {
              this.endTextNode(false);
              textUnfinished = false;
            }
            this.addPauseNode(pauseDuration);
            continue;
          }

          // Get color node information
          let color = node.getAttribute?.("data-color") || TextColor.DEFAULT;
          previousColor = currentColor;
          currentColor = color;
          if (previousColor != currentColor) {
            if (textUnfinished) {
              this.endTextNode(false);
              textUnfinished = false;
            }
            let reset = color == TextColor.DEFAULT && !isFirst;
            if (reset) {
              this.addResetColorNode();
            } else {
              this.addColorNode(color);
            }
          }

          // Get size node information
          let size = node.getAttribute?.("data-size") || TextSize.DEFAULT;
          previousSize = currentSize;
          currentSize = size;
          if (previousSize != currentSize) {
            if (textUnfinished) {
              this.endTextNode(false);
              textUnfinished = false;
            }
            this.addSizeNode(size);
          }

          // Get text
          text = node.textContent;
          // Convenience conversions
          let replaceDict = {
            "--": "—",
            '"': '\\"'
          };
          for (const [key, val] of Object.entries(replaceDict)) {
            text = text.replaceAll(key, val);
          }

          if (!textUnfinished) this.startTextNode();
          this.plaintextExport += `${text}`;
          textUnfinished = true;
        }
        if (line != nodes.length - 1) {
          if (!textUnfinished) {
            this.startTextNode();
            textUnfinished = true;
          }
          this.addLineBreak();
          lineCount++;
        }
      }
      // Add the remaining "empty lines" to get to the next bubble
      // TODO: Setting for skipping over blank bubbles on export
      let bubbleLineLimit;
      if (this.testMode) {
        // Tests are hardcoded to expect 3-line bubble output
        bubbleLineLimit = 3;
      } else {
        bubbleLineLimit = BubbleManager.type.lineCount;
      }
      while (
        b != bubbles.length - 1 &&
        bubble.bubbleContentElement.textContent &&
        (lineCount == originalLineCount || lineCount % bubbleLineLimit != 1)
      ) {
        this.addLineBreak();
        lineCount++;
      }
    }
    if (textUnfinished) {
      this.endTextNode(true);
    }
    return this.postProcess(this.plaintextExport);
  }

  // The following methods are to be defined in child classes:

  /**
   * Converts the import's plaintext into {@link BubbleToken}s.
   * The validation is lax; this function will only throw an error if the syntax is malformed.
   * Some format-specific errors may be ignored, and any malformed or unsupported tags will be excluded.
   * @param {string} plaintext
   * @returns {Array<BubbleToken>}
   */
  createTokensFromPlaintext(plaintext) {}

  /**
   * Adds any syntax that must precede a text node.
   */
  startTextNode() {}
  /**
   * Inserts a line break in the current text node.
   */
  addLineBreak() {}
  /**
   * Adds any syntax that must be appended to a text node.
   * @param {boolean} isFinal Whether this follows the final node in the export.
   */
  endTextNode(isFinal) {}
  /**
   * Inserts some configuration of control nodes as defined by the selected animation/sound preset.
   * (This function will not be called if a custom animation/sound is entered.)
   * @param {Bubble} bubble The {@link Bubble} to get animation/sound information from.
   */
  addPresetAnimNode(bubble) {}
  /**
   * Inserts a control node that sets a custom (non-preset) animation for the bubble.
   * @param {string} animation The name of the animation for the bubble.
   */
  addAnimationNode(animation) {}
  /**
   * Inserts a control node that sets a custom (non-preset) sound for the bubble.
   * @param {string} sound The sound data from the bubble.
   */
  addSoundNode(sound) {}
  /**
   * Inserts a pause node with the given duration.
   * @param {string|number} duration Either a string of type {@link PauseDuration} or a number of frames.
   */
  addPauseNode(duration) {}
  /**
   * Inserts a color node with the given color.
   * @param {*} color A string of type {@link TextColor}.
   */
  addColorNode(color) {}
  /**
   * Inserts a color-reset node.
   */
  addResetColorNode() {}
  /**
   * Inserts a size node with the given size.
   * @param {number} size A number of type {@link TextSize}.
   */
  addSizeNode(size) {}
  /**
   * Performs any needed post-processing on the output.
   * @param {string} output The output to process.
   * @returns {string} The processed output.
   */
  postProcess(output) {
    return output;
  }
}

/** An intermediary instruction between plaintext formats and Bubble data. */
export class BubbleToken {
  /**
   * Creates a new {@link BubbleToken}.
   * @param {*} value The data to apply with this instruction.
   * @param {"newTextNode" | "newNonTextNode" | "setTextAttr" | "setBubbleAttr"} instruction
   * @param {"color" | "size" | "pause" | "animation" | "sound" | undefined} type
   */
  constructor(value, instruction, type = undefined) {
    this.value = value;
    this.instruction = instruction;
    this.type = type;
  }
}
