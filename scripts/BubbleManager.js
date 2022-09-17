import Bubble from "./Bubble.js";

/** Tracks and manages the states of all Bubbles. */
export default class BubbleManager {
  static container = document.querySelector(".bubble-container");
  static template;
  static type;

  static testBubble;
  static bubbles = [];

  constructor() {
    BubbleManager.testBubble = new Bubble(-1);
    BubbleManager.bubbles.push(new Bubble(0));
    window.BubbleManager = BubbleManager;
  }

  static addBubble(parentBubble) {
    let index = BubbleManager.bubbles.indexOf(parentBubble);
    // Prevents sudden/flickery appearance from focus shift
    parentBubble.element.classList.add("del-disabled");
    let newBubble = new Bubble(index);
    BubbleManager.bubbles.splice(index + 1, 0, newBubble);
    BubbleManager.updateType(BubbleManager.type);
  }

  static deleteBubble(toDelete) {
    let index = BubbleManager.bubbles.indexOf(toDelete);
    let newFocus = BubbleManager.bubbles[index - 1];
    if (!newFocus) newFocus = BubbleManager.bubbles[index + 1];
    BubbleManager.bubbles.splice(index, 1);
    toDelete.element.classList.add("deleting");
    toDelete.element.addEventListener("animationstart", () => {
      // Trigger autofocus once all post-click events have occurred
      if (BubbleManager.bubbles.length == 1) newFocus.element.classList.add("del-disabled");
      newFocus.bubbleContentElement.focus();
    });
    toDelete.element.addEventListener("animationend", () => {
      toDelete.element.remove();
      // Allow the solitary bubble to be removed in the future if more bubbles are created
      // (there is a CSS rule hiding the button that has kicked in at this point)
      newFocus.element.classList.remove("del-disabled");
    });
  }

  static updateType(type) {
    for (let bubble of BubbleManager.bubbles) {
      bubble.element.classList.remove(BubbleManager.type);
      bubble.element.classList.add(type);
    }
    BubbleManager.type = type;
  }
}