import BubbleManager from "./BubbleManager.js";

import PresetAnimation from "./enums/PresetAnimation.js";
import ExportType from "./enums/ExportType.js";

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
   * Constructs a custom dropdown.
   * @param {Element} element The top-level element of the dropdown.
   * @param {String | null} title The title on the selector button shown in the UI. If set to
   * `null`, it will always be set to the currently selected dropdown option.
   * @param {Array<Object>} options An array of objects that each contain information about
   * each dropdown option.
   * - The `name` property is the user-facing text shown in the UI.
   * - The `value` property is the `value` attribute of the dropdown option.
   * - The `show` property is a callback that returns if the option should show in the UI. This is
   * evaluated every time the dropdown is opened and whenever an option is selected. If not
   * provided, defaults to true.
   * - The `prompt` property is the text prompt, if any, that should be presented to the user
   * to replace the value of the option. If not provided, defaults to showing no prompt.
   * - The `parse` property is a callback provided the value that returns the input if it is valid
   * and `null` if it is invalid. If not provided, defaults to accepting any input value.
   * @param {Function} callback A function that is run when a value is selected. Provided:
   * 1) the value of the dropdown
   * 2) whether the value was entered by the user
   * @param {boolean} startShowing Whether the dropdown should initialize in the showing state.
   * @param {boolean} bubbleOnly Whether the dropdown should only show when a bubble is in focus.
   * @param {Function} appearCondition A custom function that returns whether the dropdown should
   * show. This is evaluated every time the bubble container is focused or unfocused.
   */
  static initDropdown(element, title, options, callback, startShowing, bubbleOnly, appearCondition) {
    // Create title button
    const titleBtn = document.createElement("button");
    titleBtn.classList.add("select-title");
    titleBtn.textContent = title || options[0].name;
    element.appendChild(titleBtn);
    // Create option container
    const optionContainer = document.createElement("div");
    optionContainer.classList.add("select-action-container");
    element.appendChild(optionContainer);
    // Create all options
    for (const option of options) {
      const optionBtn = document.createElement("button");
      optionBtn.classList.add("select-action");
      optionBtn.setAttribute("value", option.value);
      optionBtn.textContent = option.name;
      optionBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        let dropdownValue = option.value;
        if (option.prompt) {
          dropdownValue = undefined;
          let customValue = prompt(option.prompt);
          while (dropdownValue == undefined) {
            if (customValue == "") return;
            dropdownValue = option.parse ? option.parse(customValue) : customValue;
            if (!dropdownValue) {
              dropdownValue = undefined;
              customValue = prompt("Invalid input. " + option.prompt);
            }
          }
        }
        callback(dropdownValue, option.prompt);
        // Replace focus and hide the dropdown
        element.blur();
        let dropdown = element.querySelector(".select-action-container");
        dropdown.classList.add("just-clicked");
        // Give browser time to paint before cleaning up class
        setTimeout(() => dropdown.classList.remove("just-clicked"), 20);
      });
      const optionShowCheck = () => {
        if (option.show ? option.show() : true) {
          optionBtn.classList.add("available");
        } else {
          optionBtn.classList.remove("available");
        }
      };
      element.addEventListener("mouseenter", optionShowCheck);
      element.addEventListener("focus", optionShowCheck);
      optionContainer.appendChild(optionBtn);
    }

    element.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });

    if (bubbleOnly) {
      // Toggle appearance on bubble focus/blur
      const appearCheck = (e) => {
        if (!e.target.matches(".bubble-content") && !e.target.matches(".bubble")) return;
        const isFocusOut = e.type == "focusout";
        const isAvailable = appearCondition ? appearCondition() : document.activeElement?.closest(".bubble");
        if (isAvailable && !isFocusOut) {
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

  static setAnimationBtnElement = document.getElementById("bubble-set-animation");
  static {
    const presetShowCheck = () => {
      const range = getSelection().getRangeAt(0);
      const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
      if (!selectedBubble) return false;
      return selectedBubble.sound == "none" || selectedBubble.sound == "animation";
    };
    BubbleTools.initDropdown(
      BubbleTools.setAnimationBtnElement,
      null,
      [
        {
          name: "No animation",
          value: "none"
        },
        {
          name: "Talking",
          value: "normal",
          show: presetShowCheck
        },
        {
          name: "Excited",
          value: "pleasure",
          show: presetShowCheck
        },
        {
          name: "Angry",
          value: "anger",
          show: presetShowCheck
        },
        {
          name: "Sad",
          value: "sorrow",
          show: presetShowCheck
        },
        {
          name: "Shocked",
          value: "shock",
          show: presetShowCheck
        },
        {
          name: "Thinking",
          value: "thinking",
          show: presetShowCheck
        },
        {
          name: "Other...",
          value: "custom",
          prompt: "Enter the name of an animation."
        }
      ],
      (animationName, isCustom) => {
        const range = getSelection().getRangeAt(0);
        const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
        selectedBubble.animation = animationName;
        const titleElement = BubbleTools.setAnimationBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setAnimationBtnElement.querySelector(`[value="${animationName}"]`);
        titleElement.textContent = isCustom ? "Animation: " : "";
        titleElement.textContent += titleValueBtn?.textContent || animationName;
        const soundIsWronglyAnimation = selectedBubble.sound == "animation" && (animationName == "none" || isCustom);
        if (soundIsWronglyAnimation) {
          selectedBubble.sound = "none";
          const soundTitleElement = BubbleTools.setSoundBtnElement.querySelector(".select-title");
          const soundTitleValueBtn = BubbleTools.setSoundBtnElement.querySelector(`[value="none"]`);
          soundTitleElement.textContent = soundTitleValueBtn.textContent;
        }
      },
      true,
      true,
      () => {
        // Check that a bubble is selected
        const bubbleElement = document.activeElement?.closest(".bubble");
        if (!bubbleElement) return false;
        // Animation control nodes are dialogue-only
        if (BubbleManager.type.className != "dialogue") return false;
        // Repeated set of title button is for switching bubbles
        const selectedBubble = BubbleManager.getBubbleFromNode(bubbleElement);
        const titleElement = BubbleTools.setAnimationBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setAnimationBtnElement.querySelector(`[value="${selectedBubble.animation}"]`);
        titleElement.textContent = titleValueBtn?.textContent || "Animation: " + selectedBubble.animation;
        return true;
      }
    );
  }

  static setSoundBtnElement = document.getElementById("bubble-set-sound");
  static {
    BubbleTools.initDropdown(
      BubbleTools.setSoundBtnElement,
      null,
      [
        {
          name: "No sound",
          value: "none"
        },
        {
          name: "Animation sound",
          value: "animation",
          show: () => {
            const range = getSelection().getRangeAt(0);
            const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
            if (!selectedBubble) return false;
            return PresetAnimation.OPTIONS.includes(selectedBubble.animation);
          }
        },
        {
          name: "Other...",
          value: "custom",
          prompt:
            'Enter a numeric sound value. (For BOTW, enter two sound values separated by a space.) Note that this will disable the animation preset options for this bubble until the sound option is set to "No sound".',
          parse: (soundString) => {
            const soundArray = soundString.trim().split(" ");
            if (!soundArray.find((val) => isNaN(val))) return soundString;
            else return null;
          }
        }
      ],
      (sound, isCustom) => {
        const range = getSelection().getRangeAt(0);
        const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
        selectedBubble.sound = sound;
        const titleElement = BubbleTools.setSoundBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setSoundBtnElement.querySelector(`[value="${sound}"]`);
        titleElement.textContent = isCustom ? "Sound: " : "";
        titleElement.textContent += titleValueBtn?.textContent || sound;
        const animationIsWronglyPreset = PresetAnimation.OPTIONS.includes(selectedBubble.animation) && isCustom;
        if (animationIsWronglyPreset) {
          selectedBubble.animation = "none";
          const animationTitleElement = BubbleTools.setAnimationBtnElement.querySelector(".select-title");
          const animationTitleValueBtn = BubbleTools.setAnimationBtnElement.querySelector(`[value="${selectedBubble.animation}"]`);
          animationTitleElement.textContent += animationTitleValueBtn.textContent;
        }
      },
      false,
      true,
      () => {
        // Check that a bubble is selected
        const bubbleElement = document.activeElement?.closest(".bubble");
        if (!bubbleElement) return false;
        // Sound control nodes are dialogue-only
        if (BubbleManager.type.className != "dialogue") return false;
        // Repeated set of title button is for switching bubbles
        const selectedBubble = BubbleManager.getBubbleFromNode(bubbleElement);
        const titleElement = BubbleTools.setSoundBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setSoundBtnElement.querySelector(`[value="${selectedBubble.sound}"]`);
        titleElement.textContent = titleValueBtn?.textContent || "Sound: " + selectedBubble.sound;
        return true;
      }
    );
  }

  static addPauseBtnElement = document.getElementById("bubble-add-pause");
  static {
    BubbleTools.initDropdown(
      BubbleTools.addPauseBtnElement,
      "Add pause",
      [
        {
          name: "Short",
          value: "short"
        },
        {
          name: "Long",
          value: "long"
        },
        {
          name: "Longer",
          value: "longer"
        },
        {
          name: "Other...",
          value: "custom",
          prompt: "Enter a pause duration in number of frames.",
          parse: (frameCount) => {
            const output = parseInt(frameCount);
            return !isNaN(output) ? output : null;
          }
        }
      ],
      (duration) => {
        const range = getSelection().getRangeAt(0);
        const selectedBubble = BubbleManager.getBubbleFromNode(range.endContainer);
        const newNode = selectedBubble.insertPauseNode(duration, range);
        // Move cursor after the pause
        range.setStartAfter(newNode);
      },
      false,
      true,
      () => {
        // Check that a bubble is selected
        const bubbleElement = document.activeElement?.closest(".bubble");
        if (!bubbleElement) return false;
        // Pause control nodes are useless in signs because they show all text at once
        return BubbleManager.type.className != "signboard";
      }
    );
  }

  static exportFormat = ExportType.MSYT;
  static setExportFormatBtnElement = document.getElementById("export-set-format");
  static setExportDocsElement = document.getElementById("export-docs");
  static updateExportDocsLink() {
    BubbleTools.setExportDocsElement.textContent = BubbleTools.exportFormat.docsLabel;
    BubbleTools.setExportDocsElement.setAttribute("href", BubbleTools.exportFormat.docsLink);
  }
  static {
    let dropdownOptions = [];
    for (const type in ExportType) {
      dropdownOptions.push({
        name: ExportType[type].optionLabel,
        value: ExportType[type].id
      });
    }
    BubbleTools.initDropdown(
      BubbleTools.setExportFormatBtnElement,
      null,
      dropdownOptions,
      (format) => {
        // Set export type value
        BubbleTools.exportFormat = ExportType[format];
        // Update button label
        const titleElement = BubbleTools.setExportFormatBtnElement.querySelector(".select-title");
        const titleValueBtn = BubbleTools.setExportFormatBtnElement.querySelector(`[value="${format}"]`);
        titleElement.textContent = titleValueBtn?.textContent;
        // Update docs link
        BubbleTools.updateExportDocsLink();
      },
      true,
      false,
      () => {
        return true;
      }
    );
    BubbleTools.updateExportDocsLink();
  }

  static exportBtnElement = document.getElementById("export-btn");
  static {
    // Put the bubble text on the clipboard in the selected format
    BubbleTools.exportBtnElement.addEventListener("click", () => BubbleTools.exportToClipboard(true));
    document.addEventListener("keydown", (e) => {
      if (e.code == "Enter" && e.ctrlKey && e.altKey) BubbleTools.exportToClipboard();
    });
  }

  static exportToClipboard() {
    const parser = new BubbleTools.exportFormat.parser();
    let result = parser.export(BubbleManager.bubbles, true);
    if (result) {
      navigator.clipboard.writeText(result).then(
        () => {
          let alertMsg = "The output has been copied to your clipboard.";
          window.alert(alertMsg);
        },
        () => {
          window.alert("Couldn't access the clipboard.");
        }
      );
    }
  }
}
