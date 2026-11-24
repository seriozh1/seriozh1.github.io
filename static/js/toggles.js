// [abstract] / [bibtex] / [press] buttons on the home page: show or hide the panel
// named in aria-controls.
document.querySelectorAll("button.toggle[aria-controls]").forEach(function (button) {
  button.addEventListener("click", function () {
    var panel = document.getElementById(button.getAttribute("aria-controls"));
    var open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute("aria-expanded", open);
  });
});
