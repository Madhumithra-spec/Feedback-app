const form = document.querySelector("#feedback-form");
const feedbackList = document.querySelector("#feedback-list");
const responseCount = document.querySelector("#response-count");
const formMessage = document.querySelector("#form-message");
const submitButton = document.querySelector("#submit-button");

function formatDate(value) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function renderFeedback(items) {
  feedbackList.replaceChildren();
  responseCount.textContent = `${items.length} ${items.length === 1 ? "NOTE" : "NOTES"}`;

  if (items.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No notes yet. Yours can be the first.";
    feedbackList.append(emptyState);
    return;
  }

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "feedback-item";

    const author = document.createElement("h3");
    author.className = "feedback-author";
    author.textContent = item.name;

    const date = document.createElement("time");
    date.className = "feedback-date";
    date.dateTime = item.created_at;
    date.textContent = formatDate(item.created_at);

    const rating = document.createElement("span");
    rating.className = "feedback-rating";
    rating.setAttribute("aria-label", `Rating: ${item.rating} out of 5`);
    rating.textContent = `${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}`;

    const message = document.createElement("p");
    message.className = "feedback-message";
    message.textContent = item.message;

    article.append(author, date, rating, message);
    feedbackList.append(article);
  });
}

async function loadFeedback() {
  feedbackList.innerHTML = '<p class="empty-state">Loading notes...</p>';
  try {
    const response = await fetch("/api/feedback");
    if (!response.ok) throw new Error("Could not load feedback.");
    const data = await response.json();
    renderFeedback(data.feedback);
  } catch (error) {
    feedbackList.innerHTML = '<p class="empty-state">Notes could not be loaded. Please refresh the page.</p>';
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";
  formMessage.classList.remove("error");

  const formData = new FormData(form);
  const payload = {
    name: formData.get("name").trim(),
    rating: Number(formData.get("rating")),
    feedback: formData.get("feedback").trim(),
  };

  if (!payload.name || !payload.rating || !payload.feedback) {
    formMessage.textContent = "Please complete all fields and choose a rating.";
    formMessage.classList.add("error");
    return;
  }

  submitButton.disabled = true;
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed.");

    form.reset();
    formMessage.textContent = "Your note has been received. Thank you!";
    await loadFeedback();
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
  }
});

loadFeedback();