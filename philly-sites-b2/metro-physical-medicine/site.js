// Shared motion engine: reveal, parallax, count-up, drag-rail swipe
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reveal — low threshold + generous bottom margin so tall elements always fire
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('rv-in'); io.unobserve(e.target); }
    });
  },{threshold:0.01, rootMargin:'0px 0px -4% 0px'});
  var i=0;
  document.querySelectorAll('[data-rv]').forEach(function(el){
    el.style.transitionDelay = ((i++ % 6) * 70) + 'ms';
    io.observe(el);
  });
  // safety net: reveal anything already in/near viewport on load & after fonts settle
  function sweep(){
    document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < innerHeight*0.96 && r.bottom > 0) el.classList.add('rv-in');
    });
  }
  addEventListener('load', sweep);
  setTimeout(sweep, 400);
  setTimeout(sweep, 1200);
  // header + parallax
  var hdr = document.querySelector('[data-header]');
  var pars = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var tick = false;
  function upd(){
    var y = scrollY;
    if(hdr) hdr.classList.toggle('is-stuck', y > 40);
    if(!RM) pars.forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.bottom > 0 && r.top < innerHeight){
        var p = (r.top + r.height/2 - innerHeight/2) / innerHeight;
        el.style.transform = 'translate3d(0,' + (p * 60).toFixed(1) + 'px,0)';
      }
    });
    tick = false;
  }
  addEventListener('scroll', function(){ if(!tick){ tick=true; requestAnimationFrame(upd); } }, {passive:true});
  addEventListener('resize', upd, {passive:true}); upd();
  // count up
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el=e.target, to=parseFloat(el.dataset.count), suf=el.dataset.suf||'', t0=0;
      function step(ts){ if(!t0)t0=ts; var k=Math.min(1,(ts-t0)/1200);
        el.textContent = Math.round(to*(1-Math.pow(1-k,3))) + suf;
        if(k<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });
  // drag / swipe rail with momentum
  document.querySelectorAll('[data-rail]').forEach(function(rail){
    var down=false, startX=0, startL=0, vel=0, lastX=0, raf=0;
    rail.addEventListener('pointerdown', function(e){
      down=true; startX=e.clientX; startL=rail.scrollLeft; lastX=e.clientX; vel=0;
      rail.classList.add('dragging');
      try{ rail.setPointerCapture(e.pointerId); }catch(_){}
      cancelAnimationFrame(raf);
    });
    rail.addEventListener('pointermove', function(e){
      if(!down) return;
      var dx = e.clientX - startX;
      rail.scrollLeft = startL - dx;
      vel = lastX - e.clientX; lastX = e.clientX;
    });
    function release(){
      if(!down) return; down=false; rail.classList.remove('dragging');
      (function glide(){
        if(Math.abs(vel) < .4) return;
        rail.scrollLeft += vel; vel *= .94; raf = requestAnimationFrame(glide);
      })();
    }
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('dragstart', function(e){ e.preventDefault(); });
  });
})();
