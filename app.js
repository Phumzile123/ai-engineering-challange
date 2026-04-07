const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

document.getElementById("generateAssetBtn").addEventListener("click", () => {
  const prompt = document.getElementById("assetPrompt").value.trim();
  const assetName = document.getElementById("assetName");
  const assetSummary = document.getElementById("assetSummary");

  if (!prompt) {
    assetName.textContent = "No asset selected yet.";
    assetSummary.textContent = "Please type an object description first.";
    return;
  }

  assetName.textContent = `Selected asset: ${prompt}`;

  if (prompt.toLowerCase().includes("hard hat") || prompt.toLowerCase().includes("helmet")) {
    assetSummary.textContent =
      "This tool is commonly used in construction to protect the head from falling objects and impact.";
  } else {
    assetSummary.textContent =
      "This is an AI-generated educational summary for the selected object.";
  }
});

document.getElementById("runCommandBtn").addEventListener("click", () => {
  const command = document.getElementById("avatarCommand").value.trim().toLowerCase();
  const intent = document.getElementById("avatarIntent");
  const explanation = document.getElementById("avatarExplanation");

  if (!command) {
    intent.textContent = "Intent will appear here.";
    explanation.textContent = "Please enter a command first.";
    return;
  }

  if (command.includes("wave")) {
    intent.textContent = "Intent: Greeting / Wave";
    explanation.textContent =
      "The AI interpreted this as a greeting action for welcoming the learner.";
  } else if (command.includes("walk")) {
    intent.textContent = "Intent: Movement / Walk";
    explanation.textContent =
      "The AI interpreted this as a movement instruction for the avatar.";
  } else if (command.includes("point")) {
    intent.textContent = "Intent: Pointing Gesture";
    explanation.textContent =
      "The AI interpreted this as a directional gesture to guide attention.";
  } else if (command.includes("safety") || command.includes("posture")) {
    intent.textContent = "Intent: Safety Demonstration";
    explanation.textContent =
      "The AI interpreted this as a safety posture demonstration command.";
  } else {
    intent.textContent = "Intent: General Instruction";
    explanation.textContent =
      "The AI interpreted this as a general avatar behaviour command.";
  }
});