import TextColor from "./enums/TextColor.js";
import TextSize from "./enums/TextSize.js";
import PauseDuration from "./enums/PauseDuration.js";
import Bubble from "./Bubble.js";
import BubbleManager from "./BubbleManager.js";

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
   * Modifies separated contents of a given node to be inserted into a new independent `<span>`.
   * @callback separatedRangeCallback
   * @param {DocumentFragment} formatContent The content separated from the parent node.
   * @param {Node} currentNode The original parent node of `formatContent`.
   * @returns {Node} The new node to insert into the new independent `<span>`.
   */

  /**
   * Separates the contents of the given range into an independent `<span>` element,
   * splitting the parent node of the range in the process. The contents of the new
   * `<span>` may optionally be modified using a callback; otherwise, it will inherit
   * the attributes of its content's original parent node.
   * @param {Range} range The range whose contents are to be separated.
   * @param {separatedRangeCallback} [callback] A callback that modifies the content
   * to be inserted into the new independent `<span>`.
   */
  static splitParentAndInsert(range, callback) {
    const bubbleObj = BubbleManager.getBubbleFromNode(range.startContainer);
    if (!bubbleObj) return;
    BubbleUtil.reconstructBubble(
      bubbleObj,
      (node) => range.intersectsNode(node),
      (currentNode, newParentNode) => {
        if (currentNode.textContent == "") {
          let pauseDuration = currentNode.getAttribute?.("data-pause");
          if (pauseDuration) {
            newParentNode.appendChild(BubbleUtil.newNonTextNode({ pause: pauseDuration }, Bubble.pauseNodeCallback));
          }
          return;
        }
        const isStart = currentNode.contains(range.startContainer);
        const isEnd = currentNode.contains(range.endContainer);
        if (isStart && range.startOffset != 0) {
          const preFormatRange = new Range();
          preFormatRange.setStart(range.startContainer, 0);
          preFormatRange.setEnd(range.startContainer, range.startOffset);
          const preFormatContent = preFormatRange.cloneContents();
          newParentNode.appendChild(
            BubbleUtil.newTextNode(preFormatContent, {
              node: currentNode
            })
          );
        }
        const formatRange = new Range();
        formatRange.selectNodeContents(currentNode);
        if (isStart) formatRange.setStart(range.startContainer, range.startOffset);
        if (isEnd) formatRange.setEnd(range.endContainer, range.endOffset);
        const formatContent = formatRange.cloneContents();
        if (callback) {
          newParentNode.appendChild(callback(formatContent, currentNode));
        } else {
          newParentNode.appendChild(
            BubbleUtil.newTextNode(formatContent, {
              node: currentNode
            })
          );
        }
        if (isEnd) {
          const postFormatRange = new Range();
          postFormatRange.selectNodeContents(currentNode);
          postFormatRange.setStart(range.endContainer, range.endOffset);
          if (!postFormatRange.collapsed) {
            const postFormatContent = postFormatRange.cloneContents();
            newParentNode.appendChild(
              BubbleUtil.newTextNode(postFormatContent, {
                node: currentNode
              })
            );
          }
        }
      }
    );
  }

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
    bubble.element.querySelectorAll("[data-pause]").forEach((el) => {
      el.addEventListener("click", Bubble.pauseNodeCallback);
    });
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
      // Scan each inner span / text node
      outerNodeContent.forEach((innerNode, innerIndex) => {
        if (innerIndex == outerNodeContent.length - 1 && innerNode.tagName == "BR") return;
        if (innerNode.tagName == "BR") {
          callback(null, null, true);
          return;
        } else {
          callback(innerNode, newOuterNode);
        }
      });
      // Signal manual line break
      if (index != originalOuterNodes.length - 1) {
        callback(null, null, true);
      }
      // Apply any changes to the replacement bubble
      if (applyChanges) newContentElement.appendChild(newOuterNode);
    });
    // Apply any changes to the actual bubble
    if (applyChanges) {
      bubble.bubbleContentElement.replaceChildren(...newContentElement.childNodes);
    }
  }

  /**
   * Creates and returns a new, detached Bubble textual node.
   * @param {Node} content The content of the node. Can include non-textual nodes.
   * @param {Object} args A set of parameters for the new node.
   * @param {TextColor} args.color The color attribute of the node.
   * @param {TextSize} args.size The size attribute of the node.
   * @param {Node} args.node A node to inherit the color or size from
   * if either are not specified.
   * @returns {Node} The new node.
   */
  static newTextNode(content, args) {
    let newSpan = document.createElement("span");
    newSpan.appendChild(content);
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
   * @param {Function} callback The callback to run when the UI of this node is clicked.
   * @returns {Node} The new node.
   */
  static newNonTextNode(args, callback) {
    let newSpan = document.createElement("span");
    newSpan.setAttribute("contenteditable", false);
    if (args.pause) {
      newSpan.setAttribute("data-pause", args.pause);
      newSpan.setAttribute("title", `Pause (${args.pause}${isNaN(args.pause) ? "" : " frames"})`);
    }
    let nodeSelectElement = document.createElement("span");
    nodeSelectElement.classList.add("node-select");
    newSpan.addEventListener("click", callback);
    newSpan.appendChild(nodeSelectElement);
    return newSpan;
  }
}
