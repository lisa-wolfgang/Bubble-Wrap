import Bubble from "./Bubble.js";
import BubbleTools from "./BubbleTools.js";

import BubbleType from "./enums/BubbleType.js";

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
    BubbleManager.updateType(BubbleManager.type.className);
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
    const typeObj = BubbleType[type];
    if (!typeObj) throw new Error(`"${type}" is not the identifier of a defined \`BubbleType\`. Check for typos.`);
    // Handle multiple bubbles on switch to singleton type
    if (typeObj.isSingleton && BubbleManager.bubbles.length > 1) {
      const msg = `The mode you're switching to only allows a single bubble, but you currently have multiple bubbles of a different type. Continue and remove all existing bubbles?`;
      if (confirm(msg)) {
        for (let i = BubbleManager.bubbles.length - 1; i >= 0; i--) {
          BubbleManager.deleteBubble(BubbleManager.bubbles[i]);
        }
        BubbleManager.bubbles.push(new Bubble(0));
      } else {
        BubbleTools.bubbleTypeElement.value = BubbleManager.type.className;
        return;
      }
    }
    // Convert bubbles to the new type
    const oldType = BubbleManager.type;
    BubbleManager.type = typeObj;
    for (let bubble of BubbleManager.bubbles) {
      if (oldType) bubble.element.classList.remove(oldType.className);
      bubble.element.classList.add(typeObj.className);
      if (typeObj.isSingleton) {
        bubble.element.classList.add("singleton");
      } else {
        bubble.element.classList.remove("singleton");
      }
      bubble.inputHandler(); // to recalculate overflow
    }
  }
}
