import BubbleManager from "./BubbleManager.js";

/** Manages the UI for an individual text box. */
export default class Bubble {
  constructor(index) {
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
    this.btnAddBubbleElement = this.element.querySelector(".btn-add-bubble");
    this.btnDelBubbleElement = this.element.querySelector(".btn-del-bubble");
    this.bubbleFontSize = parseInt(window.getComputedStyle(this.bubbleContentElement).getPropertyValue("font-size"));
    this.bubbleValue = "";

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

    // Clear formatting on anything pasted into the bubble
    this.bubbleContentElement.addEventListener("paste", (e) => this.sanitizePaste(e));
    this.bubbleContentElement.addEventListener("drop", (e) => this.sanitizeDrop(e));

    this.bubbleContentElement.addEventListener("input", (e) => {
      // Clear if <br> is the only content
      if (this.bubbleContentElement.innerHTML == "<br>") {
        this.bubbleContentElement.innerHTML = "";
      }

      // Flag input over three lines long
      BubbleManager.testBubble.bubbleContentElement.innerHTML = this.bubbleContentElement.innerHTML;
      let heightAndPadding = BubbleManager.testBubble.bubbleContentElement.offsetHeight;
      let padding = 2 * parseInt(getComputedStyle(BubbleManager.testBubble.bubbleContentElement).padding);
      if (heightAndPadding - padding > this.bubbleFontSize * 1.25 * 3) {
        // this.bubbleContentElement.innerHTML = this.bubbleValue;
        this.element.classList.add("overflow");
      } else {
        this.bubbleValue = this.bubbleContentElement.innerHTML;
        this.element.classList.remove("overflow");
      }
    });

    // When bubble add button is clicked, create a new bubble below this one
    this.btnAddBubbleElement.addEventListener("mousedown", (e) => {
      BubbleManager.addBubble(this);
    });

    // When bubble delete button is clicked, delete this bubble
    this.btnDelBubbleElement.addEventListener("mousedown", (e) => {
      BubbleManager.deleteBubble(this);
      // if (confirm("Are you sure you want to delete this bubble? There is no undo!"))
    });
  }

  sanitizePaste(e) {
    e.preventDefault();
    let plaintext = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plaintext);
  }

  sanitizeDrop(e) {
    e.preventDefault();
    let plaintext = e.dataTransfer.getData("text/plain");
    document.execCommand("insertText", false, plaintext);
  }
}
