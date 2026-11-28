// "Decrypt" effect: text scrambles into random glyphs and resolves left to right,
// like breaking through ICE. Runs once on load for [data-decrypt] elements and the
// page title, then on hover/focus for those plus menu links and post titles.
// The motto ([data-translation]) decrypts into its translation on hover or tap, and back.
// When the visitor prefers reduced motion, the motto swaps instantly and nothing else runs.
(function () {
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var GLYPHS = "01<>/\\[]{}#%&*+=_~^:;!?$";
  var FRAME_MS = 30;
  var FRAMES = 20;

  // Scrambles el and resolves it into text (by default, its own original text).
  function decrypt(el, text) {
    text = text || el.dataset.text || (el.dataset.text = el.textContent);
    clearInterval(el.timer);
    if (still) { el.textContent = text; return; }
    var frame = 0;
    el.timer = setInterval(function () {
      var solved = Math.floor((text.length * frame) / FRAMES);
      var out = text.slice(0, solved);
      for (var i = solved; i < text.length; i++) {
        out += /\s/.test(text[i]) ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (++frame > FRAMES) {
        clearInterval(el.timer);
        el.textContent = text;
      }
    }, FRAME_MS);
  }

  // Keep the real text available to screen readers while it is scrambled.
  function label(el) {
    var link = el.closest("a") || el;
    if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", el.textContent.trim());
  }

  document.querySelectorAll("[data-translation]").forEach(function (el) {
    var original = el.textContent;
    var translated = false;
    function show(on) {
      if (on === translated) return;
      translated = on;
      el.classList.toggle("translated", on);
      decrypt(el, on ? el.dataset.translation : original);
    }
    // Mouse: translate while hovering. Touch: each tap toggles.
    var mouse = true;
    el.addEventListener("pointerdown", function (e) { mouse = e.pointerType === "mouse"; });
    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") show(true); });
    el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") show(false); });
    el.addEventListener("click", function () { if (!mouse) show(!translated); });
  });

  if (still) return;

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
