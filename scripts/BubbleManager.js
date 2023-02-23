import Bubble from "./Bubble.js";
import BubbleTools from "./BubbleTools.js";

/** Tracks and manages the states of all Bubbles. */
export default class BubbleManager {
  static container = document.querySelector(".bubble-container");
  static template;
  static type;

  static wrappingBubble;
  static bubbles = [];
  static testBubbles = [];

  constructor() {
    BubbleManager.wrappingBubble = new Bubble(-1);
    BubbleManager.bubbles.push(new Bubble(0));
    BubbleManager.updateType(BubbleTools.bubbleTypeElement.value);
  }

  /**
   * Returns the Bubble object associated with the given node.
   * @param {Node} bubbleNode A node to associate with a Bubble object.
   * @returns {Bubble | null} The associated Bubble object, if one exists.
   */
  static getBubbleFromNode(bubbleNode) {
    const element = bubbleNode.tagName ? bubbleNode : bubbleNode.parentElement;
    const bubbleElement = element.closest(".bubble");
    if (!bubbleElement) return null;
    return BubbleManager.bubbles.find((item) => bubbleElement == item.element);
  }

  /**
   * Inserts a new bubble below the specified parent.
   * @param {Bubble} parentBubble The bubble to create this one under.
   * @param {string} text (optional) A string to prefill the new bubble with.
   */
  static addBubble(parentBubble, text) {
    let index = parentBubble.getIndex();
    // Prevents sudden/flickery appearance from focus shift
    parentBubble.element.classList.add("del-disabled");
    let newBubble = new Bubble(index, text);
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
