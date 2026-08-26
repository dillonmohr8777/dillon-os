(() => {
  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const opening = document.querySelector('[data-opening]');
  const robotControl = document.querySelector('[data-robot-control]');
  const productStage = document.querySelector('[data-product-stage]');
  const replayButton = document.querySelector('[data-replay]');
  const siteHeader = document.querySelector('[data-site-header]');
  let openingTimer = 0;
  let blinkTimer = 0;
  let blinkReleaseTimer = 0;
  let nodTimer = 0;
  let scrollFrame = 0;

  function finishOpening() {
    window.clearTimeout(openingTimer);
    opening.classList.remove('is-playing');
    opening.dataset.complete = 'true';
    scheduleBlink();
  }

  function playOpening() {
    window.clearTimeout(openingTimer);
    opening.classList.remove('is-playing');
    opening.dataset.complete = 'false';

    if (reducedMotion.matches) {
      finishOpening();
      return;
    }

    void opening.offsetWidth;
    opening.classList.add('is-playing');
    openingTimer = window.setTimeout(finishOpening, 5260);
  }

  function blink(doubleBlink = false) {
    if (!robotControl || reducedMotion.matches) return;
    window.clearTimeout(blinkReleaseTimer);
    robotControl.classList.add('is-blinking');
    blinkReleaseTimer = window.setTimeout(() => {
      robotControl.classList.remove('is-blinking');
      if (doubleBlink) {
        blinkReleaseTimer = window.setTimeout(() => {
          robotControl.classList.add('is-blinking');
          blinkReleaseTimer = window.setTimeout(() => robotControl.classList.remove('is-blinking'), 105);
        }, 105);
      }
    }, 115);
  }

  function scheduleBlink() {
    window.clearTimeout(blinkTimer);
    if (reducedMotion.matches) return;
    blinkTimer = window.setTimeout(() => {
      blink(Math.random() > 0.72);
      scheduleBlink();
    }, 2800 + Math.random() * 2600);
  }

  function nodRobot() {
    if (!robotControl || reducedMotion.matches) return;
    window.clearTimeout(nodTimer);
    robotControl.classList.remove('is-nodding');
    void robotControl.offsetWidth;
    robotControl.classList.add('is-nodding');
    blink(true);
    nodTimer = window.setTimeout(() => robotControl.classList.remove('is-nodding'), 520);
  }

  if (productStage && robotControl) {
    productStage.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = productStage.getBoundingClientRect();
      const lookX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      const lookY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
      robotControl.style.setProperty('--look-x', lookX.toFixed(3));
      robotControl.style.setProperty('--look-y', lookY.toFixed(3));
    });

    productStage.addEventListener('pointerleave', () => {
      robotControl.style.setProperty('--look-x', '0');
      robotControl.style.setProperty('--look-y', '0');
    });

    robotControl.addEventListener('click', nodRobot);
  }

  replayButton?.addEventListener('click', () => {
    window.scrollTo({ top: opening.offsetTop, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    playOpening();
  });

  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const openMenuButton = document.querySelector('[data-menu-open]');
  const closeMenuButton = document.querySelector('[data-menu-close]');

  openMenuButton?.addEventListener('click', () => mobileMenu?.showModal());
  closeMenuButton?.addEventListener('click', () => mobileMenu?.close());
  mobileMenu?.addEventListener('click', (event) => {
    if (event.target === mobileMenu) mobileMenu.close();
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => mobileMenu.close()));

  const tabs = [...document.querySelectorAll('[role="tab"]')];

  function activateTab(nextTab) {
    tabs.forEach((tab) => {
      const selected = tab === nextTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  const belief = document.querySelector('[data-belief]');
  const highlights = document.querySelector('[data-highlights]');
  const highlightTrack = document.querySelector('[data-highlight-track]');
  const highlightPanels = [...document.querySelectorAll('.highlight-panel')];
  const highlightPrevious = document.querySelector('[data-highlight-prev]');
  const highlightNext = document.querySelector('[data-highlight-next]');
  const adoptionStory = document.querySelector('[data-adoption-story]');
  const briefing = document.querySelector('[data-briefing]');
  const highlightLead = 0.1;
  const highlightRange = 0.8;
  let currentHighlight = 0;

  function sectionProgress(section) {
    if (!section) return 0;
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - section.offsetTop) / travel);
  }

  function setHighlight(index, scrollBehavior = 'smooth') {
    if (!highlights || highlightPanels.length < 2) return;
    const targetIndex = clamp(index, 0, highlightPanels.length - 1);
    const travel = Math.max(1, highlights.offsetHeight - window.innerHeight);
    const targetProgress = highlightLead + highlightRange * (targetIndex / (highlightPanels.length - 1));
    const targetTop = highlights.offsetTop + travel * targetProgress;
    window.scrollTo({ top: targetTop, behavior: reducedMotion.matches ? 'auto' : scrollBehavior });
  }

  highlightPrevious?.addEventListener('click', () => setHighlight(currentHighlight - 1));
  highlightNext?.addEventListener('click', () => setHighlight(currentHighlight + 1));

  function updateScrollScenes() {
    scrollFrame = 0;
    siteHeader.dataset.scrolled = String(window.scrollY > 12);

    if (belief) {
      belief.style.setProperty('--belief-progress', sectionProgress(belief).toFixed(4));
    }

    if (highlights && highlightTrack) {
      const rawProgress = sectionProgress(highlights);
      const progress = clamp((rawProgress - highlightLead) / highlightRange);
      const maxTranslate = Math.max(0, highlightTrack.scrollWidth - window.innerWidth + 16);
      highlightTrack.style.setProperty('--highlight-x', `${(-progress * maxTranslate).toFixed(2)}px`);
      currentHighlight = Math.round(progress * Math.max(0, highlightPanels.length - 1));
      if (highlightPrevious) highlightPrevious.disabled = currentHighlight <= 0;
      if (highlightNext) highlightNext.disabled = currentHighlight >= highlightPanels.length - 1;
    }

    if (adoptionStory) {
      const progress = sectionProgress(adoptionStory);
      const step = Math.min(2, Math.floor(progress * 3));
      adoptionStory.dataset.step = String(step);
    }

    if (briefing) {
      const progress = sectionProgress(briefing);
      const easedProgress = clamp(progress * 1.75);
      briefing.style.setProperty('--briefing-y', `${((1 - easedProgress) * 20).toFixed(2)}px`);
      briefing.style.setProperty('--briefing-scale', (0.96 + easedProgress * 0.04).toFixed(4));
    }
  }

  function requestScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollScenes);
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) finishOpening();
    else scheduleBlink();
    requestScrollUpdate();
  });

  window.addEventListener('load', () => {
    updateScrollScenes();
    playOpening();
    document.body.dataset.ready = 'true';
  }, { once: true });
})();
