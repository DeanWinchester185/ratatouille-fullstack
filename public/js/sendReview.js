document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-review");
  const text = document.getElementById("text");
  const rate = document.getElementById("rate");

  document.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      if (text.value.trim() !== "" && rate.value.trim() !== "") {
        e.preventDefault();
        form.submit();
      }
    }
  });
});
