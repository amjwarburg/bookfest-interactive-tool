let timeout;

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
    const createBookMiddle = document.createElement("button");

    createBookCard.classList.add("book-card");
    createBookCover.classList.add("book-card-cover");
    createBookAuthor.classList.add("book-card-author");
    createBookTitle.classList.add("book-card-title");
    createBookMiddle.classList.add("book-card-middle");
    createBookCover.src = book.cover_image;

    document.getElementById("book-card");
    let bookAuthor = book.author;
    let bookTitle = book.title;
    createBookTitle.textContent = bookTitle;
    createBookMiddle.textContent = "Add Book";
    createBookAuthor.textContent = bookAuthor;
    createBookCard.append(
      createBookCover,
      createBookTitle,
      createBookAuthor,
      createBookMiddle,
    );
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

  // I learned about debouncing from Gemini and this is how I implemented it.
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
