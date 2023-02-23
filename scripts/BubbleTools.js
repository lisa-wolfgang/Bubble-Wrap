import BubbleManager from "./BubbleManager.js";
import MSYTParser from "./MSYTParser.js";

/**
 * Manages the UI of all functions that work with Bubbles
 * but are not contained within a Bubble object itself.
 */
export default class BubbleTools {
  static bubbleTypeElement = document.getElementById("bubble-type");
  static {
    // Update bubble type when select menu value is changed
    BubbleTools.bubbleTypeElement.addEventListener("change", (e) => {
      BubbleManager.updateType(BubbleTools.bubbleTypeElement.value);
    });
  }

  static addPauseBtnElement = document.getElementById("bubble-add-pause");
  static {
    BubbleTools.addPauseBtnElement.addEventListener("mousedown", (e) => {
      e.preventDefault();
      let el = e.target;
      if (!el.matches(".select-action")) return;
      let duration = el.getAttribute("value");
      if (duration == "custom") {
        duration = undefined;
        let customValue = prompt("Enter a pause duration in number of frames.");
        while (duration == undefined) {
          if (customValue == "") return;
          duration = parseInt(customValue);
          if (isNaN(duration)) {
            duration = undefined;
            customValue = prompt("Invalid input. Enter a pause duration in number of frames.");
          }
        }
      }
      let range = getSelection().getRangeAt(0);
      let selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
      selectedBubble.insertPauseNode(duration, range);
      // Replace focus and hide the dropdown
      BubbleTools.addPauseBtnElement.blur();
      let dropdown = BubbleTools.addPauseBtnElement.querySelector(".select-action-container");
      dropdown.classList.add("just-clicked");
      // Give browser time to paint before cleaning up class
      setTimeout(() => dropdown.classList.remove("just-clicked"), 20);
    });

    // Toggle appearance on bubble focus/blur
    const appearCheck = () => {
      if (document.activeElement?.closest(".bubble")) {
        BubbleTools.addPauseBtnElement.classList.add("available");
      } else {
        BubbleTools.addPauseBtnElement.classList.remove("available");
      }
    };
    document.querySelector(".bubble-container").addEventListener("focusin", appearCheck);
    document.querySelector(".bubble-container").addEventListener("focusout", appearCheck);
  }

  static exportBtnElement = document.getElementById("export-btn");
  static {
    // Put the bubble text on the clipboard in MSYT format
    BubbleTools.exportBtnElement.addEventListener("click", () => BubbleTools.putMsytToClipboard(true));
    document.addEventListener("keydown", (e) => {
      if (e.code == "Enter" && e.ctrlKey && e.altKey) BubbleTools.putMsytToClipboard();
    });
  }

  static putMsytToClipboard() {
    let result = MSYTParser.export(BubbleManager.bubbles, true);
    if (result) {
      navigator.clipboard.writeText(result).then(
        () => {
          let alertMsg = "The MSYT output has been copied to your clipboard.";
          window.alert(alertMsg);
        },
        () => {
          window.alert("Couldn't access the clipboard.");
        }
      );
    }
  }
}
