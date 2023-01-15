import BubbleUtil from "./BubbleUtil.js";
import BubbleManager from "./BubbleManager.js";
import BubbleTester from "./BubbleTester.js";

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

    // Populate bubble with instantiation text
    this.bubbleContentElement.textContent = text;

    // If this is not the initial or test bubble, autofocus
    if (index > 0) {
      this.element.addEventListener("animationstart", () => {
        // Trigger autofocus once all post-click events have occurred
        this.bubbleContentElement.focus();
      });
      this.element.addEventListener("animationend", () => {
        // The delete button was disabled on the parent element earlier to prevent weird flickering,
        // but it can safely be re-enabled now
        BubbleManager.bubbles[index - 1].element.classList.remove("del-disabled");
      });
    }

    // Focus the bubble text input when any part of the bubble is clicked
    this.element.addEventListener("click", (e) => {
      if (e.target == this.element) e.preventDefault(); // prevents unfocus on text when clicked
      this.bubbleContentElement.focus();
    });
    this.element.querySelector(".bubble-content-container").addEventListener("click", (e) => {
      if (e.target == this.element.querySelector(".bubble-content-container")) e.preventDefault(); // prevents unfocus on text when clicked
      this.bubbleContentElement.focus();
    });

    // Show formatting popup when text within bubble is selected
    let textSelectTest = () => {
      let selection = getSelection();
      if (selection && selection.type == "Range" && !selection.isCollapsed) {
        let parentRect = this.element.getBoundingClientRect();
        let thisRect = this.bubbleFormattingOverlay.getBoundingClientRect();
        let selectionRect = selection.getRangeAt(0).getBoundingClientRect();
        this.bubbleFormattingOverlay.style.bottom = parentRect.bottom - selectionRect.top + "px";
        this.bubbleFormattingOverlay.style.left = selectionRect.left + selectionRect.width / 2 - thisRect.width / 2 - parentRect.left + "px";
        this.bubbleFormattingOverlay.classList.add("visible");
        setTimeout(() => {
          this.bubbleFormattingOverlay.style.transitionProperty = "opacity, transform, bottom, left";
        }, 100);
      } else {
        this.bubbleFormattingOverlay.classList.remove("visible");
        this.bubbleFormattingOverlay.style.transitionProperty = "opacity, transform";
      }
    };
    this.element.addEventListener("mousedown", textSelectTest);
    this.element.addEventListener("mouseup", textSelectTest);
    this.element.addEventListener("click", textSelectTest);
    this.element.addEventListener("keydown", textSelectTest);
    this.element.addEventListener("keyup", textSelectTest);
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
          BubbleUtil.reconstructBubble(
            this,
            (node) => range.intersectsNode(node),
            (currentNode, newParentNode) => {
              if (currentNode.textContent == "") return;
              let isStart = currentNode.contains(range.startContainer);
              let isEnd = currentNode.contains(range.endContainer);
              let sliceStart = isStart ? range.startOffset : 0;
              let sliceEnd = isEnd ? range.endOffset : undefined;
              let selectedText = currentNode.textContent.slice(sliceStart, sliceEnd);
              if (isStart && sliceStart != 0) {
                let sliceText = currentNode.textContent.slice(0, sliceStart);
                if (sliceText != "") {
                  newParentNode.appendChild(
                    BubbleUtil.newNode(sliceText, {
                      node: currentNode
                    })
                  );
                }
              }
              if (selectedText != "") {
                newParentNode.appendChild(
                  BubbleUtil.newNode(selectedText, {
                    color: color,
                    size: size,
                    node: currentNode
                  })
                );
              }
              if (isEnd && sliceEnd != currentNode.textContent.length) {
                let sliceText = currentNode.textContent.slice(sliceEnd);
                if (sliceText != "") {
                  newParentNode.appendChild(
                    BubbleUtil.newNode(sliceText, {
                      node: currentNode
                    })
                  );
                }
              }
            }
          );
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
   * Gets the numeric position of this bubble in the list.
   * @returns The index of this bubble.
   */
  getIndex() {
    return BubbleManager.bubbles.indexOf(this);
  }

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
        let isEndingFirstLine = relativeLineIndex == 0 && nextLine != undefined && !Bubble.lineIsPunctuated(nextLine) && nextNextLine != undefined && !Bubble.lineIsPunctuated(nextNextLine);
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
    return punctuation.some((p) => line.endsWith(p) || exceptionEndings.some((x) => line.endsWith(x) && (line.endsWith(p, line.length - 1) || exceptionEndings.some((x2) => line.endsWith(x2, line.length - 1) && line.endsWith(p, line.length - 2)))));
  }
}
