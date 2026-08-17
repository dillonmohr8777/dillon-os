
(function(){
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function hex(c){c=c.trim();if(c[0]!=='#')return[120,120,120];if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
  var CS=getComputedStyle(document.documentElement);
  var A=hex(CS.getPropertyValue('--accent')),B=hex(CS.getPropertyValue('--accent2'));
  var MODE=document.body.dataset.particles||'ink';
  var CFG={
    ink:{n:34,size:[1.2,3.4],life:[90,210],rise:-0.16,drift:.34,blur:0,alpha:.62,glow:0,swirl:.9},
    sparkle:{n:30,size:[.9,2.4],life:[50,120],rise:-0.1,drift:.5,blur:0,alpha:.9,glow:8,swirl:.4},
    ember:{n:28,size:[1,2.8],life:[70,150],rise:-0.42,drift:.28,blur:0,alpha:.85,glow:12,swirl:.6},
    dust:{n:40,size:[.8,2],life:[140,300],rise:-0.06,drift:.2,blur:0,alpha:.45,glow:0,swirl:1.3},
    bubble:{n:26,size:[2,6],life:[110,240],rise:-0.3,drift:.24,blur:0,alpha:.4,glow:4,swirl:.7},
    spark:{n:32,size:[.8,2.2],life:[36,90],rise:-0.05,drift:.9,blur:0,alpha:1,glow:14,swirl:.2},
    mist:{n:22,size:[6,16],life:[160,340],rise:-0.12,drift:.16,blur:6,alpha:.22,glow:0,swirl:1.6},
    gold:{n:30,size:[1,3],life:[80,190],rise:-0.2,drift:.3,blur:0,alpha:.8,glow:10,swirl:.8}
  };
  var cfg=CFG[MODE]||CFG.ink;
  document.querySelectorAll('.inkmark').forEach(function(host){
    if(RM)return;
    var cv=document.createElement('canvas');host.prepend(cv);
    var ctx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W=0,H=0,ps=[],raf=0,live=false,hot=0;
    function fit(){var r=cv.getBoundingClientRect();W=Math.max(40,r.width);H=Math.max(40,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
    function seed(p){
      p.x=W*(.18+Math.random()*.64);p.y=H*(.32+Math.random()*.46);
      p.vx=(Math.random()-.5)*cfg.drift;p.vy=cfg.rise*(.5+Math.random());
      p.r=cfg.size[0]+Math.random()*(cfg.size[1]-cfg.size[0]);
      p.l=0;p.max=cfg.life[0]+Math.random()*(cfg.life[1]-cfg.life[0]);
      p.c=Math.random()<.62?A:B;p.ph=Math.random()*6.28;
    }
    for(var i=0;i<cfg.n;i++){var p={};seed(p);p.l=Math.random()*p.max;ps.push(p);}
    function frame(){
      ctx.clearRect(0,0,W,H);
      if(cfg.blur)ctx.filter='blur('+cfg.blur+'px)';else ctx.filter='none';
      for(var i=0;i<ps.length;i++){
        var p=ps[i];p.l++;
        if(p.l>p.max){seed(p);continue;}
        var t=p.l/p.max, fade=t<.18?t/.18:(1-t)/.82;
        p.ph+=.04;
        p.x+=p.vx+Math.sin(p.ph)*cfg.swirl*.16;
        p.y+=p.vy*(1+hot*1.6);
        var a=cfg.alpha*fade*(.5+hot*.7);
        if(a<=0.004)continue;
        ctx.globalAlpha=a;
        if(cfg.glow){ctx.shadowBlur=cfg.glow;ctx.shadowColor='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+',.9)';}else ctx.shadowBlur=0;
        ctx.fillStyle='rgb('+p.c[0]+','+p.c[1]+','+p.c[2]+')';
        ctx.beginPath();
        if(MODE==='spark'){ctx.rect(p.x,p.y,p.r*2.6,p.r*.5);}
        else if(MODE==='bubble'){ctx.arc(p.x,p.y,p.r,0,6.283);ctx.globalAlpha=a*.5;}
        else {ctx.arc(p.x,p.y,p.r,0,6.283);}
        ctx.fill();
      }
      ctx.shadowBlur=0;ctx.filter='none';
      hot*=.94;
      raf=requestAnimationFrame(frame);
    }
    function on(){if(live)return;live=true;fit();raf=requestAnimationFrame(frame);}
    function off(){live=false;cancelAnimationFrame(raf);ctx.clearRect(0,0,W,H);}
    new IntersectionObserver(function(es){es[0].isIntersecting?on():off();},{rootMargin:'120px'}).observe(host);
    host.addEventListener('pointerenter',function(){hot=1;});
    addEventListener('resize',fit,{passive:true});
  });
})();
(function(){
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  // Mobile galleries expose the edge of the next item as a swipe cue. Load
  // those nearby rail images immediately so the cue is never an empty card.
  if(innerWidth<=600){
    document.querySelectorAll(':is(.rail,.heropanes,.layers,.plates,.mosaic,.pour,.gal,.feet,.silk,.disc,.fencegrid,.scans,.board,.colonnade,.deck,.gates,.sheets,.strip,.jobs,.tiles,.beds,.courses) img').forEach(function(img){
      img.loading='eager';
      if(img.decode)img.decode().catch(function(){});
    });
  }
  // appear
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting)e.target.classList.add('rv-in');
    });
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('[data-rv]').forEach(function(el,i){
    if(el.dataset.delay===undefined)el.style.transitionDelay=(i%7)*70+'ms';
    else el.style.transitionDelay=el.dataset.delay+'ms';
    io.observe(el);
  });
  // Safety net: anything already at or above the fold reveals regardless of what
  // the observer reports, so no element can ever be left permanently hidden.
  addEventListener('load',function(){
    document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(function(el){
      if(el.getBoundingClientRect().top<innerHeight)el.classList.add('rv-in');
    });
  });
  // A reveal is decoration, never a content dependency. Keep the previous
  // safety net local to the current and next viewport so later sections still
  // receive their authored entrance when a person actually reaches them.
  function releaseNearViewport(){
    document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.bottom>-160&&r.top<innerHeight*1.65)el.classList.add('rv-in');
    });
  }
  setTimeout(releaseNearViewport,1500);
  // A fast full-page traversal can move through a smooth-scrolling document
  // faster than an observer callback settles. After the authored motion has
  // had its window, release every remaining reveal so no content can stay
  // hidden because of timing or a restored deep scroll position.
  setTimeout(function(){document.querySelectorAll('[data-rv]').forEach(function(el){el.classList.add('rv-in');});},4500);
  addEventListener('scroll',releaseNearViewport,{passive:true});
  addEventListener('resize',releaseNearViewport,{passive:true});
  // scroll progress + header state + parallax + scrub
  var prog=document.querySelector('.prog'),hdr=document.querySelector('[data-header]');
  var par=[].slice.call(document.querySelectorAll('[data-par]'));
  var scrub=[].slice.call(document.querySelectorAll('[data-scrub]'));
  var tick=false;
  function upd(){
    var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(prog)prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    if(hdr)hdr.classList.toggle('is-stuck',y>28);
    if(!RM){
      for(var i=0;i<par.length;i++){var el=par[i],r=el.getBoundingClientRect();
        if(r.bottom>-200&&r.top<innerHeight+200){
          var p=(r.top+r.height/2-innerHeight/2)/innerHeight;
          el.style.setProperty('--p',p.toFixed(4));
          el.style.transform='translate3d(0,'+(p*parseFloat(el.dataset.par||18)).toFixed(2)+'px,0)';
        }}
      for(var j=0;j<scrub.length;j++){var s=scrub[j],rr=s.getBoundingClientRect();
        var t=1-Math.min(1,Math.max(0,(rr.top+rr.height*.2)/innerHeight));
        s.style.setProperty('--s',t.toFixed(4));}
    }
    tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
  addEventListener('resize',upd,{passive:true});upd();
  // liquid glass pointer sheen + 3d tilt
  document.querySelectorAll('.lg,.tilt3d').forEach(function(c){
    c.addEventListener('pointermove',function(e){
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',(x*100).toFixed(1)+'%');
      c.style.setProperty('--my',(y*100).toFixed(1)+'%');
      if(!RM&&c.classList.contains('tilt3d'))
        c.style.transform='perspective(1000px) rotateX('+((.5-y)*11).toFixed(2)+'deg) rotateY('+((x-.5)*13).toFixed(2)+'deg) translateZ(6px)';
    });
    c.addEventListener('pointerleave',function(){c.style.transform='';c.style.setProperty('--mx','50%');c.style.setProperty('--my','0%');});
  });
  // count up
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,to=parseFloat(el.dataset.count),pre=el.dataset.pre||'',suf=el.dataset.suf||'',t0=0;
    function step(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/1100),v=Math.round(to*(1-Math.pow(1-k,3)));
      el.textContent=pre+v+suf;if(k<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  });},{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});
  // magnetic cta
  if(!RM)document.querySelectorAll('[data-mag]').forEach(function(b){
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
      b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.16).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.22).toFixed(1)+'px)';});
    b.addEventListener('pointerleave',function(){b.style.transform='';});
  });
})();