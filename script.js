// ===== Point-cloud hero canvas =====
(function () {
  const canvas = document.getElementById('pointcloud');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, points;
  const COUNT = 140;

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function makePoints() {
    points = [];
    for (let i = 0; i < COUNT; i++) {
      const depth = Math.random(); // 0 = far, 1 = near
      points.push({
        x: Math.random() * w,
        y: Math.random() * h,
        depth,
        r: 1 + depth * 2.2,
        vx: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
      });
    }
  }

  function depthColor(d) {
    // far -> cyan, near -> orange (LiDAR-style depth colormap)
    const r = Math.round(94 + (255 - 94) * d);
    const g = Math.round(234 + (107 - 234) * d);
    const b = Math.round(212 + (26 - 212) * d);
    return `rgba(${r},${g},${b},${0.25 + d * 0.55})`;
  }

  let mouseX = 0.5, mouseY = 0.5;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // connective scan lines between nearby points (sparse, subtle)
    ctx.lineWidth = 1;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 * devicePixelRatio) {
          ctx.strokeStyle = `rgba(94,234,212,${0.06 * (1 - dist / (90 * devicePixelRatio))})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // points with slow parallax drift toward mouse
    const parallax = 18 * devicePixelRatio;
    for (const p of points) {
      if (!prefersReduced) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      const ox = (mouseX - 0.5) * parallax * p.depth;
      const oy = (mouseY - 0.5) * parallax * p.depth;
      ctx.fillStyle = depthColor(p.depth);
      ctx.beginPath();
      ctx.arc(p.x + ox, p.y + oy, p.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReduced) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); makePoints(); });
  resize();
  makePoints();
  draw();
})();

// ===== Category tab filtering (all-projects page) =====
(function () {
  const tabs = document.querySelectorAll('.cat-tab');
  if (!tabs.length) return;
  const blocks = document.querySelectorAll('.category-block');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      blocks.forEach((block) => {
        block.style.display = (cat === 'all' || block.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
})();
