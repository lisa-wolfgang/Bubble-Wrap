import BubbleUtil from "./BubbleUtil.js";
import BubbleManager from "./BubbleManager.js";
import BubbleTester from "./BubbleTester.js";
import MSYTParser from "./MSYTParser.js";
import PauseDuration from "./enums/PauseDuration.js";

/** Manages the UI for an individual text box. */
export default class Bubble {
  /**
   * Creates a new Bubble. This constructor should only be called internally by BubbleManager.
   * @param {int} index The index of the bubble to create this one under.
   * @param {string} text (optional) A string to prefill the bubble with.
   */
  constructor(index, text) {
    // Tracking the index reliably would require updating all bubbles when a new one is created,
    // so it is instead exposed in Bubble.prototype.getIndex() (sourced from BubbleManager)

    // Create and insert the bubble element
    this.element = document.createElement("div");
    this.element.classList.add("bubble");
    this.element.innerHTML = BubbleManager.template;
    if (index == -1) {
      this.element.classList.add("test-bubble");
      document.body.appendChild(this.element);
    } else {
      let indexBubble = BubbleManager.container.children[index];
      if (indexBubble) {
        indexBubble.insertAdjacentElement("afterend", this.element);
        index++;
      } else {
        BubbleManager.container.appendChild(this.element);
      }
    }

    this.bubbleContentElement = this.element.querySelector(".bubble-content");
    this.bubbleFormattingOverlay = this.element.querySelector(".formatting-overlay");
    this.btnAddBubbleElement = this.element.querySelector(".btn-add-bubble");
    this.btnDelBubbleElement = this.element.querySelector(".btn-del-bubble");
    this.bubbleFontSize = parseInt(window.getComputedStyle(this.bubbleContentElement).getPropertyValue("font-size"));
    this.bubbleValue = "";
    this.animation = "none";
    this.sound = "none";

    // Populate bubble with first line
    const initLine = this.initializeContents(text);

    // If this is not the initial or test bubble, autofocus
    if (index > 0) {
      this.element.addEventListener("animationstart", () => {
        // Trigger autofocus once all post-click events have occurred
        this.bubbleContentElement.focus();
        const range = getSelection().getRangeAt(0);
        range.setStart(initLine, 0);
      });
      this.element.addEventListener("animationend", () => {
        // The delete button was disabled on the parent element earlier to prevent weird flickering,
        // but it can safely be re-enabled now
        BubbleManager.bubbles[index - 1].element.classList.remove("del-disabled");
      });
    }

    // Focus the bubble text input when any part of the bubble is clicked
    this.element.addEventListener("mousedown", (e) => {
      if (e.target == this.element) e.preventDefault(); // prevents unfocus on text when clicked
      this.bubbleContentElement.focus();
    });

    // If text is cleared, repopulate with a `<div>`
    this.bubbleContentElement.addEventListener("keyup", () => {
      if (this.bubbleContentElement.childNodes.length == 0) {
        const newDiv = document.createElement("div");
        this.bubbleContentElement.appendChild(newDiv);
        getSelection().getRangeAt(0).setStart(newDiv, 0);
      }
    });

    // Show formatting popup when text within bubble is selected
    let textSelectTest = () => {
      let selection = getSelection().getRangeAt(0);
      // Check if the selection change is within a bubble
      if (selection && !selection.collapsed && selection.endContainer.parentElement.closest(".bubble") == this.element) {
        let parentRect = this.element.getBoundingClientRect();
        let thisRect = this.bubbleFormattingOverlay.getBoundingClientRect();
        let selectionRect = selection.getBoundingClientRect();
        this.bubbleFormattingOverlay.style.bottom = parentRect.bottom - selectionRect.top + "px";
        this.bubbleFormattingOverlay.style.left =
          selectionRect.left + selectionRect.width / 2 - thisRect.width / 2 - parentRect.left + "px";
        this.bubbleFormattingOverlay.classList.add("visible");
        setTimeout(() => {
          this.bubbleFormattingOverlay.style.transitionProperty = "opacity, transform, bottom, left";
        }, 100);
      } else {
        this.bubbleFormattingOverlay.classList.remove("visible");
        this.bubbleFormattingOverlay.style.transitionProperty = "opacity, transform";
      }
    };
    document.addEventListener("selectionchange", textSelectTest);
    document.addEventListener("mousedown", (e) => {
      if (!this.element.contains(e.target) || e.target.closest(".btn-add-bubble-container")) {
        this.bubbleFormattingOverlay.classList.remove("visible");
        this.bubbleFormattingOverlay.style.transitionProperty = "opacity, transform";
      }
    });

    // When a formatting button is pressed, apply the formatting on selected text
    Array.from(this.bubbleFormattingOverlay.children).forEach((el) => {
      if (el.matches("button")) {
        el.addEventListener("click", (e) => {
          let range = getSelection().getRangeAt(0);
          let color = e.currentTarget.getAttribute("data-color");
          let size = e.currentTarget.getAttribute("data-size");
          let newNode;
          BubbleUtil.splitParentAndInsert(range, (formatContent, currentNode) => {
            newNode = BubbleUtil.newTextNode(formatContent, {
              color: color,
              size: size,
              node: currentNode
            });
            return newNode;
          });
          range.setStartAfter(newNode);
        });
      }
    });

    // Perform parsing on anything pasted into the bubble
    this.bubbleContentElement.addEventListener("paste", (e) => this.parsePaste(e));
    this.bubbleContentElement.addEventListener("drop", (e) => this.parseDrop(e));

    this.bubbleContentElement.addEventListener("input", (e) => {
      // Clear if <br> is the only content
      if (this.bubbleContentElement.innerHTML == "<br>") {
        this.bubbleContentElement.innerHTML = "";
      }

      // Flag input over three lines long
      BubbleManager.wrappingBubble.bubbleContentElement.innerHTML = this.bubbleContentElement.innerHTML;
      let heightAndPadding = BubbleManager.wrappingBubble.bubbleContentElement.offsetHeight;
      let padding = 2 * parseInt(getComputedStyle(BubbleManager.wrappingBubble.bubbleContentElement).padding);
      if (heightAndPadding - padding > this.bubbleFontSize * 1.25 * 1.25 * 3) {
        // this.bubbleContentElement.innerHTML = this.bubbleValue;
        this.element.classList.add("overflow");
      } else {
        this.bubbleValue = this.bubbleContentElement.innerHTML;
        this.element.classList.remove("overflow");
      }
    });

    // When bubble add button is clicked, create a new bubble below this one
    this.btnAddBubbleElement?.addEventListener("mousedown", (e) => {
      BubbleManager.addBubble(this);
    });
    this.element.addEventListener("keydown", (e) => {
      if (e.code == "Enter" && e.ctrlKey && !e.altKey) BubbleManager.addBubble(this);
    });

    // When bubble delete button is clicked, delete this bubble
    this.btnDelBubbleElement?.addEventListener("mousedown", (e) => {
      BubbleManager.deleteBubble(this);
      // if (confirm("Are you sure you want to delete this bubble? There is no undo!"))
    });
  }

  /**
   * Sets or resets the contents to the bubble to the initial format.
   * @param {String} [text] The text to include in the initialized format.
   * @returns {Node} The first instance at which content can be inserted.
   */
  initializeContents(text) {
    this.bubbleContentElement.textContent = "";
    const initLine = document.createElement("div");
    initLine.textContent = text || "";
    this.bubbleContentElement.appendChild(initLine);
    return initLine;
  }

  /**
   * Gets the numeric position of this bubble in the list.
   * @returns The index of this bubble.
   */
  getIndex() {
    return BubbleManager.bubbles.indexOf(this);
  }

  /**
   * Inserts a pause control node into this bubble.
   * @param {PauseDuration | number} duration The duration value of the pause node.
   * @param {Range} [range] If provided, the node will be inserted at the end position of this range.
   * Otherwise, it will be appended to the bubble.
   * @returns {Node} The new Node.
   */
  insertPauseNode(duration, range) {
    let pauseNode = BubbleUtil.newNonTextNode({ pause: duration }, Bubble.pauseNodeCallback);
    if (range) {
      // Collapse the selection to the end point so `Range.insertNode()` inserts at the end point
      range.collapse(false);
      BubbleUtil.splitParentAndInsert(range, () => {
        return pauseNode;
      });
    } else {
      this.bubbleContentElement.appendChild(pauseNode);
    }
    // Check for a pause node immediately preceding the current one;
    // if one exists, remove it
    const previousSibling = pauseNode.previousElementSibling;
    if (previousSibling?.getAttribute("data-pause")) previousSibling.remove();

    return pauseNode;
  }

  static pauseNodeCallback = (e) => {
    const duration = e.currentTarget.getAttribute("data-pause");
    if (confirm(`Delete this ${duration}${isNaN(duration) ? "" : "-frame"} pause?`)) {
      e.currentTarget.remove();
    }
  };

  parsePaste(e) {
    e.preventDefault();
    let plaintext = e.clipboardData.getData("text/plain");
    this.parsePastedContent(plaintext);
  }

  parseDrop(e) {
    e.preventDefault();
    let plaintext = e.dataTransfer.getData("text/plain");
    this.parsePastedContent(plaintext);
  }

  parsePastedContent(plaintext) {
    // Convert certain characters to the variants used in-game
    // (also remove some MSYT artifacts)
    let replaceDict = {
      "\\n": "\n",
      "\\\\n": "\n",
      '\\"': '"',
      "--": "—",
      "‘": "'",
      "’": "'",
      "…": "..."
    };
    for (const [key, val] of Object.entries(replaceDict)) {
      plaintext = plaintext.replaceAll(key, val);
    }
    // If this is a text node, parse out the respective MSYT artifacts
    if (plaintext.trim().startsWith('- text: "') && plaintext.trim().endsWith('"')) {
      plaintext = plaintext.trim().slice(9, -1);
    }
    // Auto-split into multiple bubbles
    let plaintextChunks = plaintext.split("\n");
    let textLines = [];
    plaintextChunks.forEach((chunk) => {
      textLines = textLines.concat(BubbleTester.breakTextAtWrap(this, chunk));
    });
    let bubbleStartIndex = 0;
    let bubbleManagerIndex = BubbleManager.bubbles.indexOf(this);
    let lineIndex;
    let setTextChunkToOffset = setTextChunkToOffsetFunc.bind(this);
    for (lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
      let line = textLines[lineIndex];
      let nextLine = textLines[lineIndex + 1];
      let nextNextLine = textLines[lineIndex + 2];
      let relativeLineIndex = lineIndex - bubbleStartIndex;
      if (Bubble.lineIsPunctuated(line) && line != "") {
        let isEndingLastLine = relativeLineIndex >= 2;
        let isEndingSecondLine = relativeLineIndex == 1 && nextLine != undefined && !Bubble.lineIsPunctuated(nextLine);
        let isEndingFirstLine =
          relativeLineIndex == 0 &&
          nextLine != undefined &&
          !Bubble.lineIsPunctuated(nextLine) &&
          nextNextLine != undefined &&
          !Bubble.lineIsPunctuated(nextNextLine);
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
      if (bubbleStartIndex > 0) {
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
   * Determines whether or not the input string ends in sentence-ending punctuation,
   * accounting for quotation marks and parantheses.
   * @param {string} line The string to test.
   * @returns {boolean} Whether or not `line` is punctuated.
   */
  static lineIsPunctuated(line) {
    let punctuation = [".", "?", "!"];
    let exceptionEndings = ['"', "»", ")"];
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
}
