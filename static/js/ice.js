// "Decrypt" effect: text scrambles into random glyphs and resolves left to right,
// like breaking through ICE. Runs once on load for [data-decrypt] elements and the
// page title, then on hover/focus for those plus menu links and post titles.
// Disabled entirely when the visitor prefers reduced motion.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var GLYPHS = "01<>/\\[]{}#%&*+=_~^:;!?$";
  var FRAME_MS = 30;
  var FRAMES = 20;

  function decrypt(el) {
    if (el.dataset.busy) return;
    var text = el.dataset.text || (el.dataset.text = el.textContent);
    el.dataset.busy = "1";
    var frame = 0;
    var timer = setInterval(function () {
      var solved = Math.floor((text.length * frame) / FRAMES);
      var out = text.slice(0, solved);
      for (var i = solved; i < text.length; i++) {
        out += /\s/.test(text[i]) ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (++frame > FRAMES) {
        clearInterval(timer);
        el.textContent = text;
        delete el.dataset.busy;
      }
    }, FRAME_MS);
  }

  // Keep the real text available to screen readers while it is scrambled.
  function label(el) {
    var link = el.closest("a") || el;
    if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", el.textContent.trim());
  }

  var onLoad = document.querySelectorAll("[data-decrypt], h1.post-title a");
  var onHover = document.querySelectorAll("[data-decrypt], .navigation-menu a, .menu__dropdown a, .post-title a");

  onHover.forEach(function (el) {
    label(el);
    var target = el.closest("a") || el;
    target.addEventListener("mouseenter", function () { decrypt(el); });
    target.addEventListener("focus", function () { decrypt(el); });
  });
  onLoad.forEach(function (el) { label(el); decrypt(el); });
})();
