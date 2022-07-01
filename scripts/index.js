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

function updateBubbleType() {
  bubbleElement.classList.remove(bubbleType);
  bubbleType = bubbleTypeElement.value;
  bubbleElement.classList.add(bubbleType);
}
