import TextColor from "./enums/TextColor.js";
import TextSize from "./enums/TextSize.js";
import PauseDuration from "./enums/PauseDuration.js";

/** A collection of utility methods for working with a Bubble object. */
export default class BubbleUtil {
  /**
   * Evaluates if the node currently being iterated should have a callback run.
   * @callback iteratedNodeCondition
   * @param {Node} currentNode The node currently being iterated.
   * @returns {Boolean} If the node should have a callback run.
   */

  /**
   * Performs an action with the currently iterated node and a copy of its parent.
   * @callback iteratedNodeCallback
   * @param {Node} currentNode The node currently being iterated.
   * @param {Node} newParentNode A copy of the parent of `currentNode`.
   * @param {Boolean} [isManualLineBreak] Signals that a manual line break is present.
   */

  /**
   * Iterates through each text node in the Bubble and runs the callback
   * on nodes that satisfy the provided condition. The callback is provided
   * the original node as well as an identical copy of the node to modify.
   * Once all nodes have been iterated through, the content of the original
   * Bubble is then replaced by a copy with the modified nodes.
   * @param {Bubble} bubble The Bubble to reconstruct.
   * @param {iteratedNodeCondition} condition Logic to determine if the
   * node should have the reconstruction callback run.
   * @param {iteratedNodeCallback} callback Algorithm to run on the currently
   * selected node.
   */
  static reconstructBubble(bubble, condition, callback) {
    BubbleUtil.iterateInsideBubble(
      bubble,
      (currentNode, newParentNode, isManualLineBreak) => {
        if (isManualLineBreak) return;
        if (condition(currentNode)) {
          // Work with the node if it satisfies the condition
          callback(currentNode, newParentNode);
        } else {
          newParentNode.appendChild(currentNode.cloneNode(true));
        }
      },
      true
    );
  }

  /**
   * Returns a two-dimensional array of all text nodes in the given Bubble,
   * with the outer layer representing manual line breaks.
   * The nodes are copied from the original nodes, so modifications to the array
   * will not have any effect on the original nodes.
   * @param {Bubble} bubble The Bubble to retrieve text nodes from.
   * @returns {Array<Array<Node>>} A copy of text nodes from the Bubble.
   */
  static getTextNodes(bubble) {
    let nodes = [[]];
    let currentLine = 0;
    BubbleUtil.iterateInsideBubble(bubble, (currentNode, newParentNode, isManualLineBreak) => {
      if (isManualLineBreak) {
        nodes.push([]);
        currentLine++;
      } else {
        nodes[currentLine].push(currentNode);
      }
    });
    return nodes;
  }

  /**
   * Iterates through and runs the callback on each text node in the Bubble.
   * Line breaks will also be returned.
   * @param {Bubble} bubble The Bubble to iterate through.
   * @param {iteratedNodeCallback} callback The callback to execute for each node.
   * @param {Boolean} [applyChanges] If any changes made to the copy of the parent
   * should be applied to the original parent.
   */
  static iterateInsideBubble(bubble, callback, applyChanges) {
    let originalOuterNodes = bubble.bubbleContentElement.childNodes;
    let newContentElement = document.createElement("div");
    originalOuterNodes.forEach((outerNode, index) => {
      // Each outer div (lines separated by manual line breaks)
      if (index == originalOuterNodes.length - 1 && outerNode.tagName == "BR") return;
      let outerNodeContent = outerNode.childNodes;
      let newOuterNode = document.createElement("div");
      if (outerNode.hasChildNodes() && outerNode.tagName == "DIV") {
        // Scan each inner span / text node
        outerNodeContent.forEach((innerNode, innerIndex) => {
          if (innerIndex == outerNodeContent.length - 1 && innerNode.tagName == "BR") return;
          callback(innerNode, newOuterNode);
        });
        // Signal manual line break
        if (index != originalOuterNodes.length - 1) {
          callback(null, null, true);
        }
      } else {
        // There is no inner layer in the bubble
        if (outerNode.tagName == "BR") callback(null, null, true);
        else callback(outerNode, newOuterNode);
      }
      // Apply any changes to the replacement bubble
      if (applyChanges) newContentElement.appendChild(newOuterNode);
    });
    // Apply any changes to the actual bubble
    if (applyChanges) bubble.bubbleContentElement.innerHTML = newContentElement.innerHTML;
  }

  /**
   * Creates and returns a new, detached Bubble textual node.
   * @param {String} text The text content of the node.
   * @param {Object} args A set of parameters for the new node.
   * @param {TextColor} args.color The color attribute of the node.
   * @param {TextSize} args.size The size attribute of the node.
   * @param {Node} args.node A node to inherit the color or size from
   * if either are not specified.
   * @returns {Node} The new node.
   */
  static newTextNode(text, args) {
    let newSpan = document.createElement("span");
    newSpan.textContent = text;
    let newColor = args?.color || args?.node?.getAttribute?.("data-color");
    if (newColor) newSpan.setAttribute("data-color", newColor);
    let newSize = args?.size || args?.node?.getAttribute?.("data-size");
    if (newSize) newSpan.setAttribute("data-size", newSize);
    return newSpan;
  }

  /**
   * Creates and returns a new, detached Bubble non-textual node.
   * @param {Object} args A set of parameters for the new node.
   * @param {PauseDuration | number} args.pause The pause attribute of the node.
   * @returns {Node} The new node.
   */
  static newNonTextNode(args) {
    let newSpan = document.createElement("span");
    if (args.pause) newSpan.setAttribute("data-pause", args.pause);
    let nodeSelectElement = document.createElement("span");
    nodeSelectElement.classList.add("node-select");
    newSpan.appendChild(nodeSelectElement);
    return newSpan;
  }
}
