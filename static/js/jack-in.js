// Profile photo hover, after Neuromancer: a terminal runs the command from data/site.yaml (photo_hover),
// its output lines appear, a loading bar fills, then the photo turns into an ASCII portrait ("construct")
// and stays that way until the pointer leaves. On touch screens a tap starts it and a second tap resets.
// With "reduce motion" set in the system, the ASCII portrait appears directly, without the animation.
(function () {
  var fig = document.querySelector(".hero__figure[data-jack]");
  if (!fig) return;
  var cfg = JSON.parse(fig.getAttribute("data-jack"));
  var img = fig.querySelector(".hero__photo");
  var term = fig.querySelector(".jack__term");
  var cv = fig.querySelector(".jack__ascii");
  var ctx = cv.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var RAMP = " .:-=+*#%@", SCRAMBLE = "!<>-_\\/[]{}=+*^?#%&$01", SIZE = 420, COLS = 52;
  var grid = null, run = 0, active = false;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function frame() { return new Promise(function (r) { requestAnimationFrame(r); }); }

  // Brightness of each cell of the photo, stretched to the full range, mapped to a character.
  function build() {
    var t = document.createElement("canvas"); t.width = COLS; t.height = COLS;
    var c = t.getContext("2d"); c.drawImage(img, 0, 0, COLS, COLS);
    var d = c.getImageData(0, 0, COLS, COLS).data, lo = 1, hi = 0, i;
    function lum(k) { return (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255; }
    for (i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { lo = Math.min(lo, lum(i)); hi = Math.max(hi, lum(i)); }
    grid = [];
    for (i = 0; i < d.length; i += 4) {
      var v = Math.pow(Math.min(1, Math.max(0, (lum(i) - lo) / (hi - lo || 1))), 0.7) * (d[i + 3] / 255);
      grid.push({ ch: RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))], v: v });
    }
  }

  function draw(pick) {
    var cell = SIZE / COLS;
    ctx.fillStyle = "#0b0f14"; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.font = "bold " + cell * 1.2 + "px 'Fira Code', monospace"; ctx.textBaseline = "top";
    grid.forEach(function (c, i) {
      var ch = pick ? pick(i, c) : c.ch;
      if (!ch || ch === " ") return;
      ctx.fillStyle = "rgba(92,207,230," + (0.25 + 0.75 * c.v) + ")";
      ctx.fillText(ch, (i % COLS) * cell, Math.floor(i / COLS) * cell);
    });
  }

  function addLine(text, cls) {
    var line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    var old = term.querySelector(".cursor"); if (old) old.classList.remove("cursor");
    line.classList.add("cursor");
    term.appendChild(line);
    return line;
  }

  async function play() {
    var id = ++run; active = true;
    if (!grid) build();
    term.innerHTML = ""; cv.style.transition = "none"; cv.style.opacity = 0;
    if (reduce) { draw(null); cv.style.opacity = 1; return; }
    term.style.opacity = 1;
    await sleep(150);
    var cmd = addLine("", "head"), i;
    for (i = 1; i <= cfg.command.length; i++) { if (id !== run) return; cmd.textContent = cfg.command.slice(0, i); await sleep(45); }
    await sleep(150);
    for (i = 0; i < (cfg.output || []).length; i++) { if (id !== run) return; addLine(cfg.output[i]); await sleep(115); }
    var bar = addLine("");
    for (i = 0; i <= 20; i++) {
      if (id !== run) return;
      var filled = Math.round(i / 20 * 12);
      bar.textContent = "[" + "#".repeat(filled) + ".".repeat(12 - filled) + "] " + String(Math.round(i / 20 * 100)).padStart(3) + "%";
      await sleep(45);
    }
    await sleep(125); if (id !== run) return;
    var delay = grid.map(function () { return Math.random() * 400; }), t0 = performance.now();
    cv.style.opacity = 1; term.style.transition = "opacity 0.125s"; term.style.opacity = 0;
    while (id === run) {
      var e = performance.now() - t0;
      draw(function (k, cell) { return e > delay[k] ? cell.ch : (cell.v > 0.05 ? SCRAMBLE[Math.random() * SCRAMBLE.length | 0] : null); });
      if (e > 425) break;
      await frame();
    }
  }

  function reset() {
    run++; active = false;
    term.style.transition = "none"; term.style.opacity = 0; term.innerHTML = "";
    cv.style.transition = "opacity 0.4s"; cv.style.opacity = 0;
  }

  function start() { if (img.complete && img.naturalWidth) play(); else img.addEventListener("load", play, { once: true }); }

  if (canHover) {
    fig.addEventListener("mouseenter", start);
    fig.addEventListener("mouseleave", reset);
  } else {
    fig.addEventListener("click", function () { if (active) reset(); else start(); });
  }
})();
