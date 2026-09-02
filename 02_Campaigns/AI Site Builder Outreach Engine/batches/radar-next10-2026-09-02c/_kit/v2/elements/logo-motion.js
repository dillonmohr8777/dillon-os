/* logo-motion.js: header shrink on scroll + pointer tilt for the hero logo plate.
   No dependencies. No-op under prefers-reduced-motion. Append after kit.js. */
(function(){
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var head = document.querySelector('.site-head');
  if (head) {
    var last = false;
    var onScroll = function(){
      var s = (window.scrollY || document.documentElement.scrollTop) > 40;
      if (s !== last) { head.classList.toggle('is-scrolled', s); last = s; }
    };
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  }
  if (rm) return;
  var plate = document.querySelector('.hero-logo-plate[data-tilt]');
  var art = plate && plate.closest('.hero-art');
  if (!plate || !art) return;
  var raf = null, tx = 0, ty = 0;
  function apply(){ plate.style.transform = 'perspective(700px) rotateX(' + (-ty*6) + 'deg) rotateY(' + (tx*8) + 'deg) translateZ(6px)'; raf = null; }
  art.addEventListener('pointermove', function(e){
    var r = art.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5); ty = ((e.clientY - r.top) / r.height - .5);
    if (!raf) raf = requestAnimationFrame(apply);
  });
  art.addEventListener('pointerleave', function(){ tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
})();
