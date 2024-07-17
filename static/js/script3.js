const toggle_button = document.querySelector(".toggle_button");
const toggle_button_icon = document.querySelector(".toggle_button i");
const dropdown_menu = document.querySelector(".dropdown_menu");

toggle_button.onclick = function () {
  dropdown_menu.classList.toggle("open");
  const isOpen = dropdown_menu.classList.contains("open");

  toggle_button_icon.classList = isOpen
    ? "fa-solid fa-xmark"
    : "fa-solid fa-bars";
};

document.addEventListener("DOMContentLoaded", (event) => {
  const links = document.querySelectorAll(".about");
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });
});
