/* DeepPower Technology - shared behavior: footer year, flow field, page transitions. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* Page transitions: fade the current page out, then navigate.
     The next page animates itself in with CSS (.rise). */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target || a.hasAttribute("download") || a.origin !== location.origin) return;
    if (a.pathname === location.pathname) {
      if (!a.hash) e.preventDefault();
      return;
    }
    if (reduce) return;
    e.preventDefault();
    root.classList.add("leaving");
    setTimeout(function () { location.href = a.href; }, 300);
  });
  /* Back/forward cache restores the faded-out page; undo it. */
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) root.classList.remove("leaving");
  });

  /* Demo viewer ([data-demo]): one frame, one tab per demo. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-demo]"), function (el) {
    var tabs = el.querySelectorAll(".demo-tabs button"), panes = el.querySelectorAll(".pane");
    Array.prototype.forEach.call(tabs, function (t, k) {
      t.addEventListener("click", function () {
        for (var n = 0; n < tabs.length; n++) {
          tabs[n].classList.toggle("on", n === k);
          panes[n].classList.toggle("on", n === k);
        }
      });
    });
  });

  /* Flow field: thin streamlines through a slowly shifting vector field.
     Its clock is carried across pages so the motion continues between them. */
  var c = document.querySelector("canvas.field");
  if (!c || !c.getContext) return;
  var ctx = c.getContext("2d");
  var w = 0, h = 0, seeds = [], t = 0, visible = true, raf = 0;
  try { t = parseFloat(sessionStorage.getItem("dp-t")) || 0; } catch (err) {}
  window.addEventListener("pagehide", function () {
    try { sessionStorage.setItem("dp-t", String(t)); } catch (err) {}
  });

  function rng(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var r = rng(11), n = Math.round(Math.min(180, Math.max(60, (w * h) / 5200)));
    seeds = [];
    for (var i = 0; i < n; i++) {
      seeds.push({ x: r() * w * 1.1 - w * 0.25, y: r() * h * 1.2 - h * 0.1, a: 0.05 + r() * 0.2 });
    }
    draw();
  }

  function angle(x, y) {
    var k = 0.0024;
    return 0.55 * (Math.sin(x * k + t * 0.7) * 1.1 +
                   Math.cos(y * k * 1.6 - t * 0.45) * 0.9 +
                   Math.sin((x + y) * k * 0.55 + t * 0.3) * 0.6) - 0.12;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    var steps = 110, len = Math.max(5, w / 220);
    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i], x = s.x, y = s.y;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (var j = 0; j < steps; j++) {
        var a = angle(x, y);
        x += Math.cos(a) * len; y += Math.sin(a) * len;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(233,234,236," + s.a.toFixed(3) + ")";
      ctx.stroke();
    }
  }

  function loop() {
    t += 0.0035;
    draw();
    raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
  }

  function start() { if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(c);
  }
  resize();
  start();
})();
