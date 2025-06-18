document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("avatar-form");
  const btn = document.getElementById("avatar-btn");
  const file = document.getElementById("file");

  btn.addEventListener("mouseover", () => {
    btn.classList.add("avatar-hover");
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    file.click();
  });

  file.addEventListener("change", (e) => {
    form.submit();
  });
});
