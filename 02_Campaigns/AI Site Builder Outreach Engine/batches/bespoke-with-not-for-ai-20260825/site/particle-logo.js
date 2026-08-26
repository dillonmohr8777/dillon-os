(() => {
  const section = document.querySelector('[data-particle-finale]');
  const canvas = section?.querySelector('[data-particle-logo]');
  const fallback = section?.querySelector('[data-particle-fallback]');
  if (!section || !(canvas instanceof HTMLCanvasElement) || !(fallback instanceof HTMLImageElement)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context || reducedMotion.matches) {
    section.dataset.particleState = 'fallback';
    return;
  }

  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
  const easeOutExpo = (value) => value >= 1 ? 1 : 1 - Math.pow(2, -10 * value);
  const offscreen = document.createElement('canvas');
  const offscreenContext = offscreen.getContext('2d', { willReadFrequently: true });
  let particles = [];
  let animationFrame = 0;
  let startTime = 0;
  let visible = false;
  let resolved = false;
  let pointerX = 0;
  let pointerY = 0;
  let rebuildTimer = 0;

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffledIndices(length, random) {
    const indices = Array.from({ length }, (_, index) => index);
    for (let index = length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [indices[index], indices[swap]] = [indices[swap], indices[index]];
    }
    return indices;
  }

  function resizeCanvas() {
    const bounds = section.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return { width: bounds.width, height: bounds.height };
  }

  function buildParticles() {
    if (!offscreenContext || !fallback.complete || !fallback.naturalWidth) return false;
    const { width, height } = resizeCanvas();
    const sectionBounds = section.getBoundingClientRect();
    const logoBounds = fallback.getBoundingClientRect();
    const compact = width < 760;
    const sampleWidth = compact ? 760 : 1100;
    const sampleHeight = Math.max(1, Math.round(sampleWidth * fallback.naturalHeight / fallback.naturalWidth));
    offscreen.width = sampleWidth;
    offscreen.height = sampleHeight;
    offscreenContext.clearRect(0, 0, sampleWidth, sampleHeight);
    offscreenContext.drawImage(fallback, 0, 0, sampleWidth, sampleHeight);
    const pixels = offscreenContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const candidates = [];
    const step = compact ? 4 : 3;

    for (let y = 0; y < sampleHeight; y += step) {
      for (let x = 0; x < sampleWidth; x += step) {
        const offset = (y * sampleWidth + x) * 4;
        const alpha = pixels[offset + 3];
        if (alpha < 52) continue;
        candidates.push({
          x,
          y,
          red: pixels[offset],
          green: pixels[offset + 1],
          blue: pixels[offset + 2],
          alpha: alpha / 255,
        });
      }
    }

    if (!candidates.length) return false;
    const random = seededRandom(87772026);
    const order = shuffledIndices(candidates.length, random);
    const count = Math.min(compact ? 3300 : 6400, candidates.length);
    const targetLeft = logoBounds.left - sectionBounds.left;
    const targetTop = logoBounds.top - sectionBounds.top;
    const targetWidth = logoBounds.width;
    const targetHeight = logoBounds.height;
    const centerX = width / 2;
    const centerY = targetTop + targetHeight / 2;

    particles = Array.from({ length: count }, (_, index) => {
      const sample = candidates[order[index]];
      const angle = random() * Math.PI * 2;
      const radiusX = width * (0.42 + random() * 0.34);
      const radiusY = height * (0.26 + random() * 0.3);
      const strand = index % 5;
      return {
        startX: centerX + Math.cos(angle + strand * 0.16) * radiusX + (random() - 0.5) * width * 0.18,
        startY: centerY + Math.sin(angle * 1.17 + strand * 0.28) * radiusY + (random() - 0.5) * height * 0.13,
        targetX: targetLeft + (sample.x / sampleWidth) * targetWidth,
        targetY: targetTop + (sample.y / sampleHeight) * targetHeight,
        red: sample.red,
        green: sample.green,
        blue: sample.blue,
        alpha: sample.alpha,
        radius: compact ? 0.72 + random() * 0.82 : 0.62 + random() * 0.76,
        phase: random() * Math.PI * 2,
        curl: 0.55 + random() * 1.25,
      };
    });
    return true;
  }

  function render(time) {
    animationFrame = 0;
    if (!visible || !particles.length) return;
    const bounds = section.getBoundingClientRect();
    const elapsed = time - startTime;
    const rawProgress = clamp(elapsed / 2450);
    const progress = easeOutExpo(rawProgress);
    const freedom = 1 - progress;
    context.clearRect(0, 0, bounds.width, bounds.height);
    context.globalCompositeOperation = 'source-over';

    particles.forEach((particle, index) => {
      const wave = Math.sin(time * 0.0011 + particle.phase + index * 0.002) * particle.curl * freedom * 22;
      const curlX = Math.cos(particle.phase + rawProgress * Math.PI * 2.4) * freedom * 34;
      const curlY = Math.sin(particle.phase * 1.3 + rawProgress * Math.PI * 2) * freedom * 24;
      const pointerInfluence = freedom * 18 + (resolved ? 0.55 : 0);
      const x = particle.startX + (particle.targetX - particle.startX) * progress + curlX + pointerX * pointerInfluence + wave * 0.18;
      const y = particle.startY + (particle.targetY - particle.startY) * progress + curlY + pointerY * pointerInfluence + wave;
      const radius = particle.radius * (0.82 + progress * 0.36);
      context.beginPath();
      context.fillStyle = `rgba(${particle.red}, ${particle.green}, ${particle.blue}, ${Math.max(0.42, particle.alpha)})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });

    if (rawProgress > 0.86 && !resolved) {
      resolved = true;
      section.classList.add('is-resolved');
      section.dataset.particleState = 'resolved';
    }

    if (rawProgress < 1 || elapsed < 4200) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  function start() {
    if (!particles.length && !buildParticles()) {
      section.dataset.particleState = 'fallback';
      return;
    }
    window.cancelAnimationFrame(animationFrame);
    resolved = false;
    section.classList.remove('is-resolved');
    section.dataset.particleState = 'playing';
    startTime = performance.now();
    animationFrame = window.requestAnimationFrame(render);
  }

  function prepare() {
    if (!buildParticles()) {
      section.dataset.particleState = 'fallback';
      return;
    }
    section.dataset.particleState = 'ready';
    if (visible) start();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) start();
      if (!visible) window.cancelAnimationFrame(animationFrame);
    });
  }, { threshold: 0.16 });

  observer.observe(section);

  section.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = section.getBoundingClientRect();
    pointerX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
    pointerY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
  });

  section.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(() => {
      particles = [];
      prepare();
    }, 180);
  }, { passive: true });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      window.cancelAnimationFrame(animationFrame);
      section.dataset.particleState = 'fallback';
      section.classList.add('is-resolved');
    } else {
      prepare();
    }
  });

  if (fallback.complete) prepare();
  else fallback.addEventListener('load', prepare, { once: true });
  fallback.addEventListener('error', () => { section.dataset.particleState = 'fallback'; }, { once: true });
})();
