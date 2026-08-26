(() => {
  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const robotTheatre = document.querySelector('[data-robot-theatre]');
  const theatreRobot = robotTheatre?.querySelector('.robot-theatre__robot');
  const theatreShadow = robotTheatre?.querySelector('.robot-theatre__shadow');
  const humanControl = document.querySelector('[data-human-control]');
  const highlights = document.querySelector('[data-highlights]');
  const highlightTrack = document.querySelector('[data-highlight-track]');
  const highlightPanels = [...document.querySelectorAll('.highlight-panel')];
  let scrollFrame = 0;

  function sectionProgress(section) {
    if (!section) return 0;
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - section.offsetTop) / travel);
  }

  function updateRobotTheatre() {
    if (!robotTheatre || !theatreRobot) return;
    const progress = sectionProgress(robotTheatre);
    const phase = progress < 0.38 ? 0 : progress < 0.82 ? 1 : 2;
    robotTheatre.dataset.phase = String(phase);

    if (phase === 0) {
      const local = clamp(progress / 0.38);
      robotTheatre.style.setProperty('--theatre-y', `${((1 - local) * 54).toFixed(2)}px`);
      robotTheatre.style.setProperty('--theatre-scale', (0.84 + local * 0.16).toFixed(4));
      robotTheatre.style.setProperty('--theatre-rotate', `${(-8 + local * 8).toFixed(2)}deg`);
      robotTheatre.style.setProperty('--theatre-shadow', (0.72 + local * 0.28).toFixed(4));
      robotTheatre.style.setProperty('--theatre-exit', '0');
      theatreRobot.style.opacity = '1';
      if (theatreShadow) theatreShadow.style.opacity = String(0.26 + local * 0.24);
      return;
    }

    if (phase === 1) {
      const local = clamp((progress - 0.38) / 0.44);
      const float = Math.sin(local * Math.PI * 3) * 8;
      robotTheatre.style.setProperty('--theatre-y', `${float.toFixed(2)}px`);
      robotTheatre.style.setProperty('--theatre-scale', (1.02 + Math.sin(local * Math.PI) * 0.08).toFixed(4));
      robotTheatre.style.setProperty('--theatre-rotate', `${(-8 + local * 18).toFixed(2)}deg`);
      robotTheatre.style.setProperty('--theatre-shadow', (1 - Math.sin(local * Math.PI) * 0.18).toFixed(4));
      robotTheatre.style.setProperty('--theatre-exit', '0');
      theatreRobot.style.opacity = '1';
      if (theatreShadow) theatreShadow.style.opacity = '0.5';
      return;
    }

    const exit = clamp((progress - 0.82) / 0.18);
    robotTheatre.style.setProperty('--theatre-y', `${(-exit * window.innerHeight * 0.72).toFixed(2)}px`);
    robotTheatre.style.setProperty('--theatre-scale', (1 - exit * 0.28).toFixed(4));
    robotTheatre.style.setProperty('--theatre-rotate', `${(10 + exit * 18).toFixed(2)}deg`);
    robotTheatre.style.setProperty('--theatre-shadow', (1 - exit * 0.7).toFixed(4));
    robotTheatre.style.setProperty('--theatre-exit', exit.toFixed(4));
    theatreRobot.style.opacity = String(1 - exit * 0.94);
  }

  function updateHumanControl() {
    if (!humanControl) return;
    const raw = sectionProgress(humanControl);
    const progress = clamp((raw - 0.08) / 0.68);
    humanControl.style.setProperty('--human-progress', progress.toFixed(4));
  }

  function updateHighlights() {
    if (!highlights || !highlightTrack || highlightPanels.length < 2) return;
    const raw = sectionProgress(highlights);
    const progress = clamp((raw - 0.1) / 0.8);
    const firstPanel = highlightPanels[0];
    const lastPanel = highlightPanels[highlightPanels.length - 1];
    const maxTranslate = Math.max(0, lastPanel.offsetLeft - firstPanel.offsetLeft);
    highlightTrack.style.setProperty('--highlight-x', `${(-progress * maxTranslate).toFixed(2)}px`);
    const activeIndex = Math.round(progress * (highlightPanels.length - 1));
    highlightPanels.forEach((panel, index) => {
      panel.dataset.active = String(index === activeIndex);
    });
  }

  function updateScrollScenes() {
    scrollFrame = 0;
    if (reducedMotion.matches) return;
    updateRobotTheatre();
    updateHumanControl();
    updateHighlights();
  }

  function requestScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollScenes);
  }

  function pulseBlink(control, doubleBlink = false) {
    if (reducedMotion.matches) return;
    control.classList.add('is-blinking');
    window.setTimeout(() => {
      control.classList.remove('is-blinking');
      if (!doubleBlink) return;
      window.setTimeout(() => {
        control.classList.add('is-blinking');
        window.setTimeout(() => control.classList.remove('is-blinking'), 100);
      }, 105);
    }, 115);
  }

  function scheduleCharacterBlink(control) {
    if (reducedMotion.matches) return;
    const delay = 2600 + Math.random() * 3400;
    window.setTimeout(() => {
      if (document.contains(control)) {
        pulseBlink(control, Math.random() > 0.78);
        scheduleCharacterBlink(control);
      }
    }, delay);
  }

  document.querySelectorAll('[data-character-control]').forEach((control) => {
    const stage = control.closest('[data-character-stage]') || control.parentElement;
    stage?.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = stage.getBoundingClientRect();
      const lookX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      const lookY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
      control.style.setProperty('--character-x', lookX.toFixed(3));
      control.style.setProperty('--character-y', lookY.toFixed(3));
    });

    stage?.addEventListener('pointerleave', () => {
      control.style.setProperty('--character-x', '0');
      control.style.setProperty('--character-y', '0');
    });

    control.addEventListener('click', () => {
      control.classList.remove('is-nodding');
      void control.offsetWidth;
      control.classList.add('is-nodding');
      pulseBlink(control, true);
      window.setTimeout(() => control.classList.remove('is-nodding'), 620);
    });

    scheduleCharacterBlink(control);
  });

  const revealTargets = [
    ...document.querySelectorAll('.services__intro > *, .service-chapter__copy, .briefing__heading > *, .closing > div, .particle-finale__content > :not(.particle-finale__logo)'),
  ];

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach((element, index) => {
      element.dataset.reveal = '';
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      revealObserver.observe(element);
    });
  }

  function addSurfaceTilt(element, amount = 2.4) {
    element.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = element.getBoundingClientRect();
      const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1) - 0.5;
      const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1) - 0.5;
      element.style.setProperty('--tilt-x', `${(-y * amount).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${(x * amount).toFixed(2)}deg`);
    });

    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
    });
  }

  document.querySelectorAll('.highlight-panel, .briefing-shell').forEach((element) => addSurfaceTilt(element));

  document.querySelectorAll('[data-glass-scene]').forEach((scene) => {
    scene.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = scene.getBoundingClientRect();
      const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1) - 0.5;
      const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1) - 0.5;
      scene.style.setProperty('--glass-rx', `${(-y * 4.2).toFixed(2)}deg`);
      scene.style.setProperty('--glass-ry', `${(x * 5.2).toFixed(2)}deg`);
      scene.style.setProperty('--glass-tx', `${(x * 11).toFixed(2)}px`);
      scene.style.setProperty('--glass-ty', `${(y * 8).toFixed(2)}px`);
    });

    scene.addEventListener('pointerleave', () => {
      scene.style.setProperty('--glass-rx', '0deg');
      scene.style.setProperty('--glass-ry', '0deg');
      scene.style.setProperty('--glass-tx', '0px');
      scene.style.setProperty('--glass-ty', '0px');
    });
  });

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  reducedMotion.addEventListener('change', requestScrollUpdate);
  window.addEventListener('load', updateScrollScenes, { once: true });
})();
