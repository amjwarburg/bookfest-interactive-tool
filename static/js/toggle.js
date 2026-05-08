// Claude rewrote this file to use AJAX event delegation instead of toggling.
// Event delegation on document so this handles buttons added dynamically by search.js
document.addEventListener("submit", async (e) => {
  const form = e.target.closest(".add-book-form");
  if (!form) return; // Ignore submits from unrelated forms on the page
  e.preventDefault(); // Stop the browser doing a full-page POST

  const button = form.querySelector("button");
  // Disable immediately to prevent double-submission while the fetch is in flight
  button.disabled = true;

  // Claude Code added the X-CSRF-Token header; csrfToken is set as a global by layout.ejs
  const response = await fetch(form.action, {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
  });

  if (response.ok) {
    button.textContent = "✅ Added!";
    button.classList.add("active");
    // Keep the in-memory set in sync so search results rendered later show the correct state
    const bookId = parseInt(form.action.split("/").pop());
    addedBookIds.add(bookId);
  } else {
    // Re-enable on failure so the user can try again
    button.disabled = false;
  }
});
