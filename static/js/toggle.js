// Claude Code rewrote this file to toggle status between 'not read' and 'read' via AJAX.
// Event delegation on document so this handles buttons added dynamically by search.js.
document.addEventListener("submit", async (e) => {
  const form = e.target.closest(".add-book-form");
  if (!form) return; // Ignore submits from unrelated forms on the page
  e.preventDefault(); // Stop the browser doing a full-page POST

  const button = form.querySelector("button");
  // Disable briefly to prevent double-submission while the fetch is in flight
  button.disabled = true;

  // csrfToken is set as a global by layout.ejs
  const response = await fetch(form.action, {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
  });

  if (response.ok) {
    const { status } = await response.json();
    // Update the in-memory map so search results rendered later show the correct state
    const bookId = parseInt(form.action.split("/").pop());
    userBookStatuses[bookId] = status;
    // Update button label and style to reflect the new status
    updateButtonStatus(button, status);
  }
  button.disabled = false;
});

// Updates button text and colour class to match the given status string.
// 'read' → teal (.active), 'not read' → red (.not-read)
function updateButtonStatus(button, status) {
  if (status === "read") {
    button.textContent = "Read ✅";
    button.classList.add("active");
    button.classList.remove("not-read");
  } else {
    button.textContent = "Not Read";
    button.classList.add("not-read");
    button.classList.remove("active");
  }
}
