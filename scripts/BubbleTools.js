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

  /**
   * Attaches event listeners to a custom dropdown.
   * @param {Element} element The top-level element of the dropdown.
   * @param {Array<Object>} exceptions An array of information about dropdown options
   * that require further user input.
   * The `value` property is the `value` attribute of the dropdown option.
   * The `prompt` property is the instruction presented to the user in the text prompt.
   * The `parse` property is a callback provided the value that parses and returns its input.
   * The `condition` property is a callback provided the value that returns whether the parsed
   * input is valid.
   * @param {Function} callback A function provided the value of the dropdown that is run when
   * a value is selected.
   * @param {boolean} startShowing Whether the dropdown should initialize in the showing state.
   * @param {boolean} bubbleOnly Whether the dropdown should only show when a bubble is in focus.
   * @param {Function} appearCondition A custom function that returns whether the dropdown should
   * show when focus changes in the bubble container.
   */
  static initDropdown(element, exceptions, callback, startShowing, bubbleOnly, appearCondition) {
    element.addEventListener("mousedown", (e) => {
      e.preventDefault();
      let el = e.target;
      if (!el.matches(".select-action")) return;
      let dropdownValue = el.getAttribute("value");
      for (const ex of exceptions) {
        if (dropdownValue == ex.value) {
          dropdownValue = undefined;
          let customValue = prompt(ex.prompt);
          while (dropdownValue == undefined) {
            if (customValue == "") return;
            dropdownValue = ex.parse(customValue);
            if (!ex.condition(dropdownValue)) {
              dropdownValue = undefined;
              customValue = prompt("Invalid input. " + ex.prompt);
            }
          }
        }
      }
      callback(dropdownValue);
      // Replace focus and hide the dropdown
      element.blur();
      let dropdown = element.querySelector(".select-action-container");
      dropdown.classList.add("just-clicked");
      // Give browser time to paint before cleaning up class
      setTimeout(() => dropdown.classList.remove("just-clicked"), 20);
    });

    if (bubbleOnly) {
      // Toggle appearance on bubble focus/blur
      const appearCheck = () => {
        let isAvailable = appearCondition ? appearCondition() : document.activeElement?.closest(".bubble");
        if (isAvailable) {
          element.classList.add("available");
        } else {
          element.classList.remove("available");
        }
      };
      document.querySelector(".bubble-container").addEventListener("focusin", appearCheck);
      document.querySelector(".bubble-container").addEventListener("focusout", appearCheck);
    } else if (startShowing) {
      element.classList.add("available");
    }
  }

  static setEmotionBtnElement = document.getElementById("bubble-set-emotion");
  static {
    BubbleTools.initDropdown(
      BubbleTools.setEmotionBtnElement,
      [],
      (emotion) => {
        const range = getSelection().getRangeAt(0);
        const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
        selectedBubble.emotion = emotion;
        const titleElement = BubbleTools.setEmotionBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setEmotionBtnElement.querySelector(`[value="${emotion}"]`);
        titleElement.textContent = titleValueBtn.textContent;
        if (emotion != "none") {
          BubbleTools.setSoundBtnElement.classList.add("available");
        } else {
          BubbleTools.setSoundBtnElement.classList.remove("available");
        }
      },
      true,
      true,
      () => {
        const bubbleElement = document.activeElement?.closest(".bubble");
        if (!bubbleElement) return false;
        const selectedBubble = BubbleManager.getBubbleFromNode(bubbleElement);
        const titleElement = BubbleTools.setEmotionBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setEmotionBtnElement.querySelector(`[value="${selectedBubble.emotion}"]`);
        titleElement.textContent = titleValueBtn.textContent;
        return true;
      }
    );
  }

  static setSoundBtnElement = document.getElementById("bubble-set-sound");
  static {
    BubbleTools.initDropdown(
      BubbleTools.setSoundBtnElement,
      [],
      (sound) => {
        const range = getSelection().getRangeAt(0);
        const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
        selectedBubble.sound = sound;
        const titleElement = BubbleTools.setSoundBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setSoundBtnElement.querySelector(`[value="${sound}"]`);
        titleElement.textContent = titleValueBtn.textContent;
      },
      false,
      true,
      () => {
        const bubbleElement = document.activeElement?.closest(".bubble");
        if (!bubbleElement) return false;
        const selectedBubble = BubbleManager.getBubbleFromNode(bubbleElement);
        const titleElement = BubbleTools.setSoundBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setSoundBtnElement.querySelector(`[value="${selectedBubble.sound}"]`);
        titleElement.textContent = titleValueBtn.textContent;
        return selectedBubble.emotion != "none";
      }
    );
  }

  static addPauseBtnElement = document.getElementById("bubble-add-pause");
  static {
    BubbleTools.initDropdown(
      BubbleTools.addPauseBtnElement,
      [
        {
          value: "custom",
          prompt: "Enter a pause duration in number of frames.",
          parse: (frameCount) => parseInt(frameCount),
          condition: (frameCount) => !isNaN(frameCount)
        }
      ],
      (duration) => {
        const range = getSelection().getRangeAt(0);
        const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
        const newNode = selectedBubble.insertPauseNode(duration, range);
        // Move cursor after the pause
        range.setStartAfter(newNode);
      },
      true,
      true
    );
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
