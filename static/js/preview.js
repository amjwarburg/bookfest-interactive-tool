document
  .getElementById("coverInput")
  .addEventListener("change", function (event) {
    const [file] = event.target.files;
    const preview = document.getElementById("coverPreview");

    if (file) {
      // Create a temporary URL for the selected file
      preview.src = URL.createObjectURL(file);

      // Preview the image
      preview.classList.remove("d-none");

      // Clean up memory when image loaded
      preview.onload = () => {
        URL.revokeObjectURL(preview.src);
      };
    } else {
      // If user cancels selection, hide the preview again
      preview.classList.add("d-none");
    }
  });
