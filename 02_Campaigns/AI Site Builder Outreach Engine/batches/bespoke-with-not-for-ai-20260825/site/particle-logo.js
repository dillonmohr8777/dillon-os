(() => {
  const section = document.querySelector('[data-particle-finale]');
  const canvas = section?.querySelector('[data-particle-logo]');
  const fallback = section?.querySelector('[data-particle-fallback]');
  const seed = section?.querySelector('[data-particle-seed]');
  const replay = section?.querySelector('[data-particle-replay]');
  const seedImage = seed?.querySelector('.character-frame--open img');

  if (
    !section ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(fallback instanceof HTMLImageElement) ||
    !(seed instanceof HTMLElement) ||
    !(replay instanceof HTMLButtonElement) ||
    !(seedImage instanceof HTMLImageElement)
  ) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const context = canvas.getContext('2d', { alpha: true });
  const sampler = document.createElement('canvas');
  const samplerContext = sampler.getContext('2d', { willReadFrequently: true });

  if (!context || !samplerContext || reducedMotion.matches) {
    section.dataset.particleState = 'fallback';
    section.classList.add('is-resolved');
    return;
  }

  const DURATION = 3700;
  const HOLD_DURATION = 6000;
  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
  const mix = (start, end, progress) => start + (end - start) * progress;
  const easeInOutCubic = (value) => value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const easeOutExpo = (value) => value >= 1 ? 1 : 1 - Math.pow(2, -10 * value);

  let particles = [];
  let animationFrame = 0;
  let startTime = 0;
  let visible = false;
  let resolved = false;
  let pointerX = 0;
  let pointerY = 0;
  let rebuildTimer = 0;

  function seededRandom(seedValue) {
    let value = seedValue >>> 0;
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
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return { width: bounds.width, height: bounds.height };
  }

  function sampleImage(image, sampleWidth, step, alphaThreshold) {
    const sampleHeight = Math.max(1, Math.round(sampleWidth * image.naturalHeight / image.naturalWidth));
    sampler.width = sampleWidth;
    sampler.height = sampleHeight;
    samplerContext.clearRect(0, 0, sampleWidth, sampleHeight);
    samplerContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    const pixels = samplerContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const candidates = [];

    for (let y = 0; y < sampleHeight; y += step) {
      for (let x = 0; x < sampleWidth; x += step) {
        const offset = (y * sampleWidth + x) * 4;
        const alpha = pixels[offset + 3];
        if (alpha < alphaThreshold) continue;
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

    return { candidates, width: sampleWidth, height: sampleHeight };
  }

  function cubicPoint(start, controlOne, controlTwo, end, progress) {
    const inverse = 1 - progress;
    return (
      inverse * inverse * inverse * start +
      3 * inverse * inverse * progress * controlOne +
      3 * inverse * progress * progress * controlTwo +
      progress * progress * progress * end
    );
  }

  function buildParticles() {
    if (
      !fallback.complete || !fallback.naturalWidth ||
      !seedImage.complete || !seedImage.naturalWidth
    ) return false;

    const { width, height } = resizeCanvas();
    const sectionBounds = section.getBoundingClientRect();
    const logoBounds = fallback.getBoundingClientRect();
    const seedBounds = seed.getBoundingClientRect();
    const compact = width < 760;
    const targetSamples = sampleImage(fallback, compact ? 820 : 1180, compact ? 4 : 3, 54);
    const seedSamples = sampleImage(seedImage, compact ? 520 : 680, compact ? 4 : 3, 44);

    if (!targetSamples.candidates.length || !seedSamples.candidates.length) return false;

    const random = seededRandom(87772026);
    const targetOrder = shuffledIndices(targetSamples.candidates.length, random);
    const seedOrder = shuffledIndices(seedSamples.candidates.length, random);
    const count = Math.min(compact ? 4300 : 7800, targetSamples.candidates.length);
    const logoLeft = logoBounds.left - sectionBounds.left;
    const logoTop = logoBounds.top - sectionBounds.top;
    const seedLeft = seedBounds.left - sectionBounds.left;
    const seedTop = seedBounds.top - sectionBounds.top;
    const centerX = seedLeft + seedBounds.width / 2;
    const centerY = seedTop + seedBounds.height / 2;
    const laneOffsets = [-0.27, -0.17, -0.07, 0.07, 0.17, 0.27];

    particles = Array.from({ length: count }, (_, index) => {
      const target = targetSamples.candidates[targetOrder[index]];
      const source = seedSamples.candidates[seedOrder[index % seedOrder.length]];
      const lane = index % laneOffsets.length;
      const targetX = logoLeft + (target.x / targetSamples.width) * logoBounds.width;
      const targetY = logoTop + (target.y / targetSamples.height) * logoBounds.height;
      const startX = seedLeft + (source.x / seedSamples.width) * seedBounds.width;
      const startY = seedTop + (source.y / seedSamples.height) * seedBounds.height;
      const direction = targetX < centerX ? -1 : 1;
      const laneY = centerY + laneOffsets[lane] * height;
      const settleDistance = compact ? 9 : 14;

      return {
        startX,
        startY,
        controlOneX: centerX + direction * width * (0.1 + random() * 0.17),
        controlOneY: laneY + (random() - 0.5) * height * 0.035,
        controlTwoX: targetX - direction * width * (0.07 + random() * 0.12),
        controlTwoY: targetY + laneOffsets[lane] * height * 0.1,
        settleX: targetX + (random() - 0.5) * settleDistance,
        settleY: targetY + (random() - 0.5) * settleDistance,
        targetX,
        targetY,
        sourceRed: source.red,
        sourceGreen: source.green,
        sourceBlue: source.blue,
        red: target.red,
        green: target.green,
        blue: target.blue,
        alpha: target.alpha,
        radius: compact ? 0.68 + random() * 0.8 : 0.58 + random() * 0.72,
        phase: random() * Math.PI * 2,
        pulse: 0.45 + random() * 0.75,
      };
    });

    return true;
  }

  function particlePosition(particle, travelProgress, settleProgress, time, chargeProgress) {
    if (travelProgress <= 0) {
      const chargeWave = Math.sin(time * 0.012 + particle.phase) * particle.pulse * chargeProgress * 2.8;
      return {
        x: particle.startX + Math.cos(particle.phase) * chargeWave,
        y: particle.startY + Math.sin(particle.phase) * chargeWave,
      };
    }

    const travel = easeInOutCubic(travelProgress);
    const pathX = cubicPoint(particle.startX, particle.controlOneX, particle.controlTwoX, particle.settleX, travel);
    const pathY = cubicPoint(particle.startY, particle.controlOneY, particle.controlTwoY, particle.settleY, travel);
    const settle = easeOutExpo(settleProgress);
    const pointerScale = settleProgress > 0.98 ? 0.42 : 0;

    return {
      x: mix(pathX, particle.targetX, settle) + pointerX * Math.sin(particle.phase) * pointerScale,
      y: mix(pathY, particle.targetY, settle) + pointerY * Math.cos(particle.phase) * pointerScale,
    };
  }

  function render(time) {
    animationFrame = 0;
    if (!visible || !particles.length) return;

    const bounds = section.getBoundingClientRect();
    const elapsed = time - startTime;
    const progress = clamp(elapsed / DURATION);
    const chargeProgress = clamp(progress / 0.17);
    const travelProgress = clamp((progress - 0.16) / 0.58);
    const settleProgress = clamp((progress - 0.74) / 0.26);
    const dissolveProgress = clamp((progress - 0.08) / 0.14);
    const sourceReveal = easeInOutCubic(dissolveProgress);
    const visualCharge = progress < 0.46
      ? chargeProgress
      : mix(1, 0.42, clamp((progress - 0.46) / 0.54));

    section.style.setProperty('--particle-charge', visualCharge.toFixed(4));
    section.style.setProperty('--particle-dissolve', dissolveProgress.toFixed(4));
    section.dataset.particleSource = sourceReveal <= 0
      ? 'robot'
      : sourceReveal >= 1
        ? 'particles'
        : 'crossfade';
    context.clearRect(0, 0, bounds.width, bounds.height);

    if (travelProgress > 0.04 && travelProgress < 0.98) {
      context.globalCompositeOperation = 'lighter';
      context.lineCap = 'round';
      context.lineWidth = 0.55;
      particles.forEach((particle, index) => {
        if (index % 7 !== 0) return;
        const current = particlePosition(particle, travelProgress, 0, time, chargeProgress);
        const previous = particlePosition(particle, clamp(travelProgress - 0.032), 0, time - 20, chargeProgress);
        const colorProgress = clamp((travelProgress - 0.08) / 0.74);
        const red = Math.round(mix(particle.sourceRed, particle.red, colorProgress));
        const green = Math.round(mix(particle.sourceGreen, particle.green, colorProgress));
        const blue = Math.round(mix(particle.sourceBlue, particle.blue, colorProgress));
        context.beginPath();
        context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${0.08 + (1 - settleProgress) * 0.18})`;
        context.moveTo(previous.x, previous.y);
        context.lineTo(current.x, current.y);
        context.stroke();
      });
    }

    context.globalCompositeOperation = 'source-over';
    particles.forEach((particle, index) => {
      const position = particlePosition(particle, travelProgress, settleProgress, time, chargeProgress);
      const colorProgress = clamp(travelProgress * 0.88 + settleProgress * 0.2);
      const red = Math.round(mix(particle.sourceRed, particle.red, colorProgress));
      const green = Math.round(mix(particle.sourceGreen, particle.green, colorProgress));
      const blue = Math.round(mix(particle.sourceBlue, particle.blue, colorProgress));
      const chargeFlicker = travelProgress === 0
        ? 0.7 + Math.sin(time * 0.008 + particle.phase + index * 0.003) * 0.24
        : 1;
      const resolvedShimmer = settleProgress >= 1
        ? 0.94 + Math.sin(time * 0.0018 + particle.phase) * 0.06
        : 1;
      const radius = particle.radius * mix(1.14, 0.92, settleProgress);

      context.beginPath();
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${Math.max(0.38, particle.alpha) * chargeFlicker * resolvedShimmer * sourceReveal})`;
      context.arc(position.x, position.y, radius, 0, Math.PI * 2);
      context.fill();
    });

    if (progress > 0.9 && !resolved) {
      resolved = true;
      section.classList.add('is-resolved');
      section.dataset.particleState = 'resolved';
    }

    if (progress < 1 || elapsed < HOLD_DURATION) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  function start() {
    if (!particles.length && !buildParticles()) return;
    window.cancelAnimationFrame(animationFrame);
    resolved = false;
    section.classList.remove('is-resolved');
    section.dataset.particleState = 'playing';
    section.dataset.particleSource = 'robot';
    section.style.setProperty('--particle-charge', '0');
    section.style.setProperty('--particle-dissolve', '0');
    startTime = performance.now();
    animationFrame = window.requestAnimationFrame(render);
  }

  function prepare() {
    if (
      !fallback.complete || !fallback.naturalWidth ||
      !seedImage.complete || !seedImage.naturalWidth
    ) return;

    if (!buildParticles()) {
      section.dataset.particleState = 'fallback';
      section.classList.add('is-resolved');
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

  replay.addEventListener('click', () => {
    if (visible) start();
  });

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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.cancelAnimationFrame(animationFrame);
    else if (visible) start();
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      window.cancelAnimationFrame(animationFrame);
      section.dataset.particleState = 'fallback';
      section.classList.add('is-resolved');
    } else {
      particles = [];
      prepare();
    }
  });

  [fallback, seedImage].forEach((image) => {
    if (!image.complete) image.addEventListener('load', prepare, { once: true });
    image.addEventListener('error', () => {
      section.dataset.particleState = 'fallback';
      section.classList.add('is-resolved');
    }, { once: true });
  });

  prepare();
})();
