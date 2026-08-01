import BubbleUtil from "./BubbleUtil.js";
import BubbleManager from "./BubbleManager.js";
import BubbleTester from "./BubbleTester.js";
import Parser from "./Parser.js";
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
      BubbleManager.container.appendChild(this.element);
    } else if (index < BubbleManager.bubbles.length) {
      const indexBubble = BubbleManager.bubbles[index];
      indexBubble.element.insertAdjacentElement("afterend", this.element);
      index++;
    } else {
      BubbleManager.container.appendChild(this.element);
    }

    this.bubbleContentElement = this.element.querySelector(".bubble-content");
    this.bubbleFormattingOverlay = this.element.querySelector(".formatting-overlay");
    this.btnAddBubbleElement = this.element.querySelector(".btn-add-bubble");
    this.btnDelBubbleElement = this.element.querySelector(".btn-del-bubble");
    this.bubbleValue = "";
    this.bubbleHeight = 0;
    this.lineCount = 0;
    this.animation = "none";
    this.sound = "none";

    // Populate bubble with first line
    this.initializeContents(text);

    // Add UI logic for visible bubbles
    if (index > -1) {
      // Focus the bubble text input when any part of the bubble is clicked
      this.element.addEventListener("mousedown", (e) => {
        if (e.target == this.element) e.preventDefault(); // prevents unfocus on text when clicked
        this.bubbleContentElement.focus();
        // Ensure the cursor is inside the initial `<div>` when the bubble is empty
        if (!this.bubbleContentElement.firstElementChild.textContent) {
          getSelection().setPosition(this.bubbleContentElement.firstElementChild, 0);
        }
      });

      // If text is cleared, repopulate with a `<div>`
      this.bubbleContentElement.addEventListener("keyup", () => {
        if (this.bubbleContentElement.childNodes.length == 0) {
          const newDiv = document.createElement("div");
          this.bubbleContentElement.appendChild(newDiv);
          getSelection().getRangeAt(0).setStart(newDiv, 0);
        } else if (this.bubbleContentElement.childNodes.length == 1 && !this.bubbleContentElement.firstElementChild) {
          // This content should be put in a node
          const newDiv = document.createElement("div");
          newDiv.textContent = this.bubbleContentElement.textContent;
          this.bubbleContentElement.textContent = "";
          this.bubbleContentElement.appendChild(newDiv);
          getSelection().getRangeAt(0).selectNodeContents(newDiv);
          getSelection().collapseToEnd();
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

      this.bubbleContentElement.addEventListener("input", () => this.inputHandler());
      this.inputHandler(); // run once to evaluate overflow status

      // When bubble add button is clicked, create a new bubble below this one
      const addAndAutofocusBubble = () => {
        const newBubble = BubbleManager.addBubble(this);
        newBubble.focus();
      };
      this.btnAddBubbleElement?.addEventListener("mousedown", addAndAutofocusBubble);
      this.element.addEventListener("keydown", (e) => {
        if (e.code == "Enter" && e.ctrlKey && !e.altKey && !BubbleManager.type.isSingleton) addAndAutofocusBubble();
      });

      // When bubble delete button is clicked, delete this bubble
      this.btnDelBubbleElement?.addEventListener("mousedown", (e) => {
        BubbleManager.deleteBubble(this);
        // if (confirm("Are you sure you want to delete this bubble? There is no undo!"))
      });

      this.element.addEventListener("animationend", () => {
        // The delete button was disabled on the parent element earlier to prevent weird flickering,
        // but it can safely be re-enabled now
        if (index > 0) BubbleManager.bubbles[index - 1].element.classList.remove("del-disabled");
      });
    }
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

  /** Focuses the end of the bubble's contents. */
  focus() {
    this.element.addEventListener("animationstart", () => {
      // Trigger once all post-click events have occurred
      this.bubbleContentElement.focus();
      const range = getSelection()?.getRangeAt(0);
      const initLine = this.bubbleContentElement.lastChild;
      if (range && initLine) range.setStartAfter(initLine);
    });
  }

  inputHandler() {
    // Clear if <br> is the only content
    const isIsolatedBreak = this.bubbleContentElement.innerHTML == "<br>";
    const isIsolatedBreakNode =
      this.bubbleContentElement.childElementCount == 1 && this.bubbleContentElement.firstElementChild.innerHTML == "<br>";
    if (isIsolatedBreak || isIsolatedBreakNode) {
      this.bubbleContentElement.innerHTML = "";
    }

    // Flag input over the line count or character limit
    let charCount = 0;
    for (const div of this.bubbleContentElement.childNodes) {
      charCount += div.textContent.length;
    }
    let bubbleHeight = 0;
    for (const el of this.bubbleContentElement.children) {
      bubbleHeight += el.offsetHeight;
    }
    if (this.bubbleHeight != bubbleHeight) {
      // Cached line count is invalid, so recalculate
      const testBubble = new Bubble(-1);
      testBubble.bubbleContentElement.classList.add("test-line-count");
      this.lineCount = 0;
      for (const el of this.bubbleContentElement.children) {
        testBubble.bubbleContentElement.innerHTML = el.outerHTML;
        // getClientRects() counts lines of text when display is set to inline
        this.lineCount += testBubble.bubbleContentElement.firstChild.getClientRects().length;
      }
      testBubble.element.remove();
      this.bubbleHeight = bubbleHeight;
    }
    const exceedsLineCount = this.lineCount > BubbleManager.type.lineCount;
    const exceedsCharLimit = BubbleManager.type.charLimit && charCount > BubbleManager.type.charLimit;
    if (exceedsLineCount || exceedsCharLimit) {
      // this.bubbleContentElement.innerHTML = this.bubbleValue;
      this.element.classList.add("overflow");
    } else {
      this.bubbleValue = this.bubbleContentElement.innerHTML;
      this.element.classList.remove("overflow");
    }
  }

  /**
   * Appends a node to this bubble. Creates a new line by default (or if this bubble is empty.)
   * @param {Node} node The node to append.
   * @param {boolean} [appendToLine] Whether the new node will be appended to the existing last line of the bubble.
   */
  appendNode(node, appendToLine) {
    const lastLine = this.bubbleContentElement.lastChild;
    if (appendToLine && lastLine) {
      lastLine.appendChild(node);
    } else {
      const newLine = document.createElement("div");
      newLine.appendChild(node);
      this.bubbleContentElement.appendChild(newLine);
    }
  }

  /**
   * Inserts a textual node into this bubble. The default behavior is to append it as a new line in the bubble.
   * @param {Node} content The content of the node. Can include non-textual nodes.
   * @param {Object} args A set of parameters for the new node. See {@link BubbleUtil.newTextNode()}.
   * @param {boolean} [appendToLine] Whether the new node will be appended to the existing last line of the bubble.
   * @param {Range} [range] If provided, the node will replace this range.
   * @returns {Node} The new Node.
   */
  insertTextNode(content, args, appendToLine, range) {
    const newNode = BubbleUtil.newTextNode(content, args);
    if (range) {
      BubbleUtil.splitParentAndInsert(range, () => {
        return newNode;
      });
      range.deleteContents();
    } else {
      this.appendNode(newNode, appendToLine);
    }
    // Recalculate overflow status
    this.inputHandler();
    return newNode;
  }

  /**
   * Inserts a non-textual node into this bubble.
   * @param {Object} args A set of parameters for the new node. See {@link BubbleUtil.newNonTextNode()}.
   * @param {Function} callback The callback to run when the UI of this node is clicked.
   * @param {Range} [range] If provided, the node will be inserted at the end position of this range.
   * Otherwise, it will be appended to the existing last line of the bubble.
   * @returns {Node} The new Node.
   */
  insertNonTextNode(args, callback, range) {
    const newNode = BubbleUtil.newNonTextNode(args, callback);
    if (range) {
      // Collapse the selection to the end point so `Range.insertNode()` inserts at the end point
      range.collapse(false);
      BubbleUtil.splitParentAndInsert(range, () => {
        return newNode;
      });
    } else {
      this.appendNode(newNode, true);
    }
    return newNode;
  }

  /**
   * Inserts a pause control node into this bubble.
   * @param {PauseDuration | number} duration The duration value of the pause node.
   * @param {Range} [range] If provided, the node will be inserted at the end position of this range.
   * Otherwise, it will be appended to the bubble.
   * @returns {Node} The new Node.
   */
  insertPauseNode(duration, range) {
    let pauseNode = this.insertNonTextNode({ pause: duration }, Bubble.pauseNodeCallback, range);

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
    // Try parsing as MSYT
    let parser = new MSYTParser();
    const wasMSYTImportSuccess = parser.import(plaintext);
    if (wasMSYTImportSuccess) return;
    // Otherwise paste as plaintext
    else Parser.appendAsBubbles(plaintext, this);
  }
}
