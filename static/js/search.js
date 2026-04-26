// Assign the search bar to a variable
const searchInput = document.querySelector("#book-search");

// Listen for typing
searchInput.addEventListener("input", async (readEvent) => {
  const query = searchInput.value;

  // Update the URL
  const newURL = window.location.pathname + "?q=" + encodeURIComponent(query);
  window.history.replaceState(null, "", newURL);

  // Fetch from Express API
  const response = await fetch("api/search?q=" + query);
  const data = await response.json();

  // Create a container to remove old results
  const containter = document.querySelector(".book-grid");
  containter.innerHTML = "";
});
