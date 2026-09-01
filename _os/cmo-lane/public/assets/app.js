(function () {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  var canvas = document.getElementById('constellation');
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var nodes = [];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    var hero = canvas.parentElement;
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(w, h);
  }

  function seed(w, h) {
    nodes = [];
    var count = 19;
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: 40 + Math.random() * (w - 80),
        y: 40 + Math.random() * (h - 80),
        r: i < 4 ? 2.8 : 1.6,
        gold: i < 4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18
      });
    }
  }

  function tick() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var i, j, a, b, dx, dy, dist;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 20 || a.x > w - 20) a.vx *= -1;
      if (a.y < 20 || a.y > h - 20) a.vy *= -1;
    }
    ctx.lineWidth = 1;
    for (i = 0; i < nodes.length; i++) {
      for (j = i + 1; j < nodes.length; j++) {
        a = nodes[i];
        b = nodes[j];
        dx = a.x - b.x;
        dy = a.y - b.y;
        dist = Math.hypot(dx, dy);
        if (dist < 140) {
          ctx.strokeStyle = 'rgba(225,169,59,' + (0.18 * (1 - dist / 140)) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      ctx.beginPath();
      ctx.fillStyle = a.gold ? '#E1A93B' : 'rgba(238,192,105,0.45)';
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(tick);
})();
