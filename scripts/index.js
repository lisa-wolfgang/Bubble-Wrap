let bubbleTypeElement = document.getElementById("bubble-type");
let bubbleElement = document.querySelector(".bubble");
let bubbleContentElement = document.querySelector(".bubble-content");
let bubbleType = bubbleTypeElement.value;

bubbleElement.classList.add("no-transition");
updateBubbleType();
bubbleElement.parentElement.offsetHeight; // necessary to force CSS reload in time
bubbleElement.classList.remove("no-transition");

bubbleTypeElement.addEventListener("change", () => {
  updateBubbleType();
});

bubbleElement.addEventListener("mousedown", (e) => {
  if (e.target == bubbleElement) e.preventDefault(); // prevents unfocus on text when clicked
  bubbleContentElement.focus();
});

// Clear formatting on anything pasted into the bubble
bubbleContentElement.addEventListener("paste", (e) => sanitizePaste(e));
document.addEventListener("drop", (e) => e.preventDefault());
bubbleContentElement.addEventListener("drop", (e) => sanitizeDrop(e));
function updateBubbleType() {
  bubbleElement.classList.remove(bubbleType);
  bubbleType = bubbleTypeElement.value;
  bubbleElement.classList.add(bubbleType);
}

function sanitizePaste(e) {
  e.preventDefault();
  let plaintext = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, plaintext);
}

function sanitizeDrop(e) {
  e.preventDefault();
  let plaintext = e.dataTransfer.getData("text/plain");
  document.execCommand("insertText", false, plaintext);
}
