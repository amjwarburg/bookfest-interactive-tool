const toggles = document.querySelectorAll(".book-card-middle");
toggles.forEach((toggle) => {
  toggle.addEventListener("click", function (click) {
    const isActive = toggle.classList.contains("active");
    if (!isActive) {
      toggle.classList.add("active");
      toggle.innerHTML = "✅ Read!";
    } else {
      toggle.classList.remove("active");
      toggle.innerHTML = "Add!";
    }
  });
});
