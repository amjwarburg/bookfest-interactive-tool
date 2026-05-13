let timeout;
let selectedGenre = null;

const display = (data) => {
  if (data.length == 0) {
    const createNoResults = document.createElement("h3");
    const booksGrid = document.getElementById("books-grid");
    createNoResults.classList.add("no-results");
    createNoResults.textContent = "No Books Found";
    booksGrid.append(createNoResults);
  }
};

// Define a function for rendering books
const renderBooks = (bookArray) => {
  const booksGrid = document.getElementById("books-grid");
  bookArray.forEach((book) => {
    const createBookCard = document.createElement("div");
    const createBookTitle = document.createElement("h5");
    const createBookAuthor = document.createElement("p");
    const createBookCover = document.createElement("img");

    createBookCard.classList.add("book-card");
    createBookCover.classList.add("book-card-cover");
    createBookAuthor.classList.add("book-card-author");
    createBookTitle.classList.add("book-card-title");
    createBookCover.src = book.cover_image;
    createBookTitle.textContent = book.title;
    createBookAuthor.textContent = book.author;

    // Claude Code added this link so cover images in search results navigate to the info page, matching books.ejs
    const createBookLink = document.createElement("a");
    createBookLink.href = `/books/info/${book.id}`;
    createBookLink.append(createBookCover);
    createBookCard.append(createBookLink, createBookTitle, createBookAuthor);

    // Claude Code updated the Add button logic to use userBookStatuses (book_id → status map)
    if (typeof isLoggedIn !== "undefined" && isLoggedIn) {
      // Check the in-memory map populated from the server so the button starts in the right state
      const bookStatus =
        typeof userBookStatuses !== "undefined"
          ? userBookStatuses[book.id]
          : null;
      const createForm = document.createElement("form");
      const createBookMiddle = document.createElement("button");

      // The form action must be set so toggle.js can POST to the correct endpoint
      createForm.classList.add("add-book-form");
      createForm.action = `/books/${book.id}`;
      createForm.method = "POST";
      createBookMiddle.classList.add("book-card-middle", "prevent-select");
      createBookMiddle.type = "submit";
      // Label and colour reflect current status: unadded → 'Add!', not read → red, read → teal
      if (bookStatus === "read") {
        createBookMiddle.textContent = "Read ✅";
        createBookMiddle.classList.add("active");
      } else if (bookStatus === "not read") {
        createBookMiddle.textContent = "Not Read";
        createBookMiddle.classList.add("not-read");
      } else {
        createBookMiddle.textContent = "Add!";
      }

      createForm.append(createBookMiddle);
      createBookCard.append(createForm);
    }

    booksGrid.append(createBookCard);
  });
};

// Assign the search bar to a variable
const searchInput = document.querySelector("#book-search");

// Listen for typing
searchInput.addEventListener("input", async (readEvent) => {
  const container = document.querySelector(".books-grid");
  const query = searchInput.value;

  // Update the URL
  const newURL = window.location.pathname + "?q=" + encodeURIComponent(query);
  window.history.replaceState(null, "", newURL);

  // I learned about debouncing from Gemini and YouTube and this is how I implemented it:
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    // Fetch from Express API
    if (query.length > 1) {
      const response = await fetch("/books/api/search?q=" + query);
      const data = await response.json();

      container.innerHTML = "";
      renderBooks(data);
      display(data);
    } else {
      const response = await fetch("/books/api/all");
      const allBooksData = await response.json();
      container.innerHTML = "";
      renderBooks(allBooksData);
    }
  }, 300);
});

const genreButtons = document.querySelectorAll("[data-genre-id]");
const allButton = document.querySelector(".all-genres-button");

genreButtons.forEach((genreButton) => {
  genreButton.addEventListener("click", async () => {
    selectedGenre = genreButton.dataset.genreId;
    const container = document.querySelector(".books-grid");
    const response = await fetch("/books/api/filter?genre=" + selectedGenre);
    const data = await response.json();
    container.innerHTML = "";
    renderBooks(data);
    display(data);
  });
});

allButton.addEventListener("click", async () => {
  selectedGenre = null;
  const container = document.querySelector(".books-grid");
  const response = await fetch("/books/api/all");
  const data = await response.json();
  container.innerHTML = "";
  renderBooks(data);
});
