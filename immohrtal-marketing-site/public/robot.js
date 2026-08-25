/* =====================================================================
   CREW , solid-mesh 3D robot renderer (raw WebGL, no libraries)
   Draws one procedural robot into each element matching [data-bot].
   Fixed full-viewport canvas behind the DOM; each robot is rendered
   into its slot's screen rect via gl.viewport + scissor. Dark metallic
   body, emissive accent visor/core, rim lighting, idle bob + cursor
   tracking, hover emphasis. Independent of the spine background canvas.
   ===================================================================== */
(function () {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  var canvas = document.getElementById("crew-stage");
  if (!canvas) return;
  if (reduced) { canvas.remove(); return; }
  var slots = [].slice.call(document.querySelectorAll("[data-bot]"));
  if (!slots.length) { canvas.remove(); return; }

  var gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false, depth: true });
  if (!gl) { canvas.remove(); return; }              // SVG fallback in each slot stays visible
  document.documentElement.classList.add("crew-gl");  // hides the SVG fallbacks

  /* ---------- mat4 (column-major) ---------- */
  function ident(o){o[0]=1;o[1]=0;o[2]=0;o[3]=0;o[4]=0;o[5]=1;o[6]=0;o[7]=0;o[8]=0;o[9]=0;o[10]=1;o[11]=0;o[12]=0;o[13]=0;o[14]=0;o[15]=1;return o;}
  function mul(o,a,b){
    var a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],
        a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    for(var i=0;i<4;i++){var b0=b[i*4],b1=b[i*4+1],b2=b[i*4+2],b3=b[i*4+3];
      o[i*4]=b0*a00+b1*a10+b2*a20+b3*a30;o[i*4+1]=b0*a01+b1*a11+b2*a21+b3*a31;
      o[i*4+2]=b0*a02+b1*a12+b2*a22+b3*a32;o[i*4+3]=b0*a03+b1*a13+b2*a23+b3*a33;}
    return o;
  }
  function persp(o,fov,asp,n,f){var t=1/Math.tan(fov/2),nf=1/(n-f);o[0]=t/asp;o[1]=0;o[2]=0;o[3]=0;o[4]=0;o[5]=t;o[6]=0;o[7]=0;o[8]=0;o[9]=0;o[10]=(f+n)*nf;o[11]=-1;o[12]=0;o[13]=0;o[14]=2*f*n*nf;o[15]=0;return o;}
  function trans(o,x,y,z){ident(o);o[12]=x;o[13]=y;o[14]=z;return o;}
  function scale(o,x,y,z){ident(o);o[0]=x;o[5]=y;o[10]=z;return o;}
  function rotY(o,a){ident(o);var c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
  function rotX(o,a){ident(o);var c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
  function rotZ(o,a){ident(o);var c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}

  /* ---------- shaders ---------- */
  var VS = [
    "attribute vec3 aPos; attribute vec3 aNorm;",
    "uniform mat4 uMVP; uniform mat3 uNM;",
    "varying vec3 vN; varying vec3 vP;",
    "void main(){ vN = normalize(uNM * aNorm); vP = aPos; gl_Position = uMVP * vec4(aPos,1.0); }"
  ].join("\n");
  var FS = [
    "precision mediump float;",
    "varying vec3 vN; varying vec3 vP;",
    "uniform vec3 uAlbedo; uniform vec3 uEmis; uniform vec3 uAccent; uniform float uEmisK;",
    "void main(){",
    "  vec3 N = normalize(vN);",
    "  vec3 V = vec3(0.0,0.0,1.0);",
    /* soft ambient environment: cool top, warm-dim bottom (SH-ish) */
    "  float up = N.y*0.5+0.5;",
    "  vec3 amb = mix(vec3(0.05,0.06,0.09), vec3(0.14,0.16,0.20), up);",
    /* key light (upper-left front) */
    "  vec3 L1 = normalize(vec3(-0.5,0.85,0.7));",
    "  float d1 = max(dot(N,L1),0.0);",
    /* accent rim light from lower right */
    "  vec3 L2 = normalize(vec3(0.8,-0.2,0.5));",
    "  float d2 = max(dot(N,L2),0.0);",
    /* specular (metallic streak) */
    "  vec3 H = normalize(L1+V); float spec = pow(max(dot(N,H),0.0), 42.0);",
    /* fresnel rim in accent hue */
    "  float fres = pow(1.0 - max(dot(N,V),0.0), 3.0);",
    "  vec3 col = uAlbedo * (amb + d1*vec3(0.9,0.95,1.0)*0.9);",
    "  col += uAccent * d2 * 0.35;",
    "  col += vec3(1.0) * spec * 0.6;",
    "  col += uAccent * fres * 0.9;",
    "  col += uEmis * uEmisK;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null;}return o;}
  var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);
  var prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(prog));canvas.remove();return;}
  gl.useProgram(prog);
  var aPos=gl.getAttribLocation(prog,"aPos"),aNorm=gl.getAttribLocation(prog,"aNorm");
  var uMVP=gl.getUniformLocation(prog,"uMVP"),uNM=gl.getUniformLocation(prog,"uNM"),
      uAlbedo=gl.getUniformLocation(prog,"uAlbedo"),uEmis=gl.getUniformLocation(prog,"uEmis"),
      uAccent=gl.getUniformLocation(prog,"uAccent"),uEmisK=gl.getUniformLocation(prog,"uEmisK");

  /* ---------- cube (pos+normal interleaved) ---------- */
  function buildCube(){
    var f=[ // face: 4 corners + normal
      [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],
      [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],
      [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],
      [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]],
      [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],
      [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]
    ];
    var arr=[];
    f.forEach(function(F){
      var n=F[4],q=[F[0],F[1],F[2],F[0],F[2],F[3]];
      q.forEach(function(p){arr.push(p[0]*0.5,p[1]*0.5,p[2]*0.5,n[0],n[1],n[2]);});
    });
    return new Float32Array(arr);
  }
  var cube=buildCube();
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,cube,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,24,0);
  gl.enableVertexAttribArray(aNorm);gl.vertexAttribPointer(aNorm,3,gl.FLOAT,false,24,12);
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);

  /* ---------- five bodies, one bounded job and silhouette per worker ---------- */
  var METAL=[0.085,0.098,0.115], DARK=[0.055,0.062,0.075];
  /* part: position, scale, material kind, albedo, rotation XYZ, motion code */
  function P(x,y,z,sx,sy,sz,kind,mat,rx,ry,rz,motion){
    return [x,y,z,sx,sy,sz,kind,mat,rx||0,ry||0,rz||0,motion||0];
  }

  var SCOUT=[
    P(0,0.00,0,.52,.68,.38,0,METAL), P(0,-.04,.20,.30,.24,.055,1),
    P(0,.64,0,.66,.40,.40,0,METAL), P(0,.67,.215,.58,.105,.055,1),
    P(-.24,1.00,0,.045,.34,.045,0,DARK,0,0,-.16,1), P(.24,1.00,0,.045,.34,.045,0,DARK,0,0,.16,1),
    P(-.30,1.20,0,.12,.10,.10,1), P(.30,1.20,0,.12,.10,.10,1),
    P(-.48,.08,0,.13,.48,.15,0,DARK,0,0,-.10), P(.48,.08,0,.13,.48,.15,0,DARK,0,0,.10),
    P(-.49,-.21,0,.18,.13,.19,0,METAL), P(.49,-.21,0,.18,.13,.19,0,METAL),
    P(0,-.58,0,.28,.15,.23,0,DARK), P(-.36,.36,0,.22,.12,.22,0,METAL), P(.36,.36,0,.22,.12,.22,0,METAL)
  ];

  var ATLAS=[
    P(0,.01,0,.67,.73,.44,0,METAL), P(0,-.06,.22,.36,.28,.055,1),
    P(0,.66,0,.55,.45,.44,0,METAL), P(0,.68,.23,.38,.11,.055,1),
    P(-.55,.08,0,.17,.53,.19,0,DARK), P(.55,.08,0,.17,.53,.19,0,DARK),
    P(-.55,-.23,0,.22,.15,.23,0,METAL), P(.55,-.23,0,.22,.15,.23,0,METAL), P(0,-.63,0,.34,.16,.26,0,DARK),
    P(0,1.13,-.16,.45,.045,.045,1,null,0,0,0,2), P(0,.20,-.16,.45,.045,.045,1,null,0,0,0,2),
    P(-.48,.67,-.16,.045,.45,.045,1,null,0,0,0,2), P(.48,.67,-.16,.045,.45,.045,1,null,0,0,0,2),
    P(-.34,1.00,-.16,.045,.30,.045,1,null,0,0,-.78,2), P(.34,1.00,-.16,.045,.30,.045,1,null,0,0,.78,2),
    P(-.34,.34,-.16,.045,.30,.045,1,null,0,0,.78,2), P(.34,.34,-.16,.045,.30,.045,1,null,0,0,-.78,2)
  ];

  var FORGE=[
    P(0,0,0,.80,.75,.49,0,METAL), P(0,-.04,.25,.42,.31,.06,1),
    P(0,.68,0,.58,.43,.47,0,METAL), P(0,.70,.24,.45,.11,.06,1),
    P(-.66,.36,0,.43,.25,.32,0,METAL), P(.66,.36,0,.43,.25,.32,0,METAL),
    P(-.68,.03,0,.24,.60,.23,0,DARK), P(.68,.03,0,.24,.60,.23,0,DARK),
    P(-.69,-.32,0,.38,.30,.34,0,METAL), P(.69,-.32,0,.38,.30,.34,0,METAL), P(0,-.64,0,.45,.18,.30,0,DARK),
    P(.98,.08,.02,.075,.95,.075,0,DARK,0,0,-.10,3), P(.98,.60,.02,.58,.20,.20,0,METAL,0,0,-.10,3),
    P(.98,.60,.22,.26,.075,.05,1,null,0,0,-.10,3)
  ];

  var RELAY=[
    P(0,.00,-.17,.68,.75,.22,0,DARK), P(0,.00,0,.52,.69,.37,0,METAL), P(0,-.04,.20,.28,.28,.055,1),
    P(0,.66,0,.54,.42,.40,0,METAL), P(0,.68,.215,.45,.10,.055,1),
    P(-.62,.24,-.05,.18,.68,.13,0,DARK,0,0,-.55), P(.62,.24,-.05,.18,.68,.13,0,DARK,0,0,.55),
    P(-.44,.04,0,.13,.50,.15,0,DARK,0,0,-.12), P(.53,.48,0,.14,.56,.16,0,DARK,0,0,-.36),
    P(-.46,-.25,0,.18,.14,.19,0,METAL), P(.69,.79,0,.20,.16,.20,0,METAL), P(0,-.59,0,.27,.15,.23,0,DARK),
    P(.78,1.02,.05,.20,.045,.05,1,null,0,0,0,4), P(.78,1.18,.05,.31,.045,.05,1,null,0,0,0,4), P(.78,1.36,.05,.42,.045,.05,1,null,0,0,0,4)
  ];

  var PROOF=[
    P(0,.00,0,.60,.72,.42,0,METAL), P(0,-.05,.22,.33,.28,.055,1),
    P(0,.66,0,.57,.44,.43,0,METAL), P(-.16,.68,.23,.20,.095,.055,1),
    P(.20,.80,.245,.19,.035,.045,1), P(.20,.56,.245,.19,.035,.045,1), P(.08,.68,.245,.035,.19,.045,1), P(.32,.68,.245,.035,.19,.045,1),
    P(-.50,.08,0,.15,.52,.17,0,DARK), P(.51,.08,0,.15,.52,.17,0,DARK), P(.51,-.22,0,.21,.14,.21,0,METAL),
    P(-.69,-.03,.02,.48,.72,.19,0,METAL), P(-.69,.34,.02,.31,.16,.20,0,METAL),
    P(-.77,-.05,.225,.075,.22,.04,1,null,0,0,-.65), P(-.62,-.13,.225,.075,.38,.04,1,null,0,0,.62),
    P(0,-.62,0,.31,.16,.25,0,DARK), P(.69,-.10,.04,.09,.47,.09,0,DARK,0,0,-.38), P(.82,-.35,.05,.22,.12,.18,1,null,0,0,-.38,5)
  ];

  var PROFILES=[
    {parts:SCOUT, scale:[.94,1.02,.94], bobAmp:.055,bobSpeed:2.7,yawAmp:.30,yawSpeed:2.3,pointerYaw:1.4,pointerPitch:.55,roll:.045,rollSpeed:2.1,pulse:4.2},
    {parts:ATLAS, scale:[.94,.97,.94], bobAmp:.022,bobSpeed:.72,yawAmp:.08,yawSpeed:.40,pointerYaw:.55,pointerPitch:.24,roll:.012,rollSpeed:.35,pulse:1.35},
    {parts:FORGE, scale:[.86,.95,.86], bobAmp:.040,bobSpeed:1.55,yawAmp:.09,yawSpeed:.62,pointerYaw:.72,pointerPitch:.28,roll:.025,rollSpeed:1.2,pulse:2.0},
    {parts:RELAY, scale:[.91,.96,.91], bobAmp:.075,bobSpeed:3.25,yawAmp:.19,yawSpeed:1.75,pointerYaw:1.12,pointerPitch:.43,roll:.055,rollSpeed:2.8,pulse:5.4},
    {parts:PROOF, scale:[.90,.98,.90], bobAmp:.018,bobSpeed:1.15,yawAmp:.055,yawSpeed:.75,pointerYaw:.45,pointerPitch:.18,roll:.018,rollSpeed:.8,pulse:2.8}
  ];
  /* cohesive cool accents (teal→cyan→green→azure), one per agent */
  var ACC=[
    [0.286,0.773,0.714],[0.184,0.831,0.596],[0.431,0.878,1.0],[0.208,0.816,0.498],
    [0.36,0.85,0.78],[0.30,0.72,1.0],[0.24,0.90,0.66],[0.5,0.9,0.85]
  ];

  /* ---------- state ---------- */
  var mx=innerWidth/2, my=innerHeight/2;
  addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY;},{passive:true});
  var bots=slots.map(function(el,i){
    var da=el.getAttribute("data-acc");
    var acc=da?da.split(",").map(Number):ACC[i%ACC.length];
    return {el:el, acc:acc, hover:0, hoverT:0, phase:i*1.7, profile:PROFILES[i%PROFILES.length]};
  });
  slots.forEach(function(el,i){
    var hot = el.closest ? (el.closest(".agent") || el) : el;
    hot.addEventListener("mouseenter",function(){bots[i].hoverT=1;});
    hot.addEventListener("mouseleave",function(){bots[i].hoverT=0;});
  });

  /* scratch matrices */
  var mProj=new Float32Array(16),mView=new Float32Array(16),mRobot=new Float32Array(16),
      mPart=new Float32Array(16),mTmp=new Float32Array(16),mMVP=new Float32Array(16),
      mT=new Float32Array(16),mS=new Float32Array(16),mRy=new Float32Array(16),mRx=new Float32Array(16),mRz=new Float32Array(16),
      mLocal=new Float32Array(16),mLocal2=new Float32Array(16),
      nm=new Float32Array(9);
  function normalFromRot(o,r){ // upper-left 3x3 of a pure-rotation mat4
    o[0]=r[0];o[1]=r[1];o[2]=r[2];o[3]=r[4];o[4]=r[5];o[5]=r[6];o[6]=r[8];o[7]=r[9];o[8]=r[10];return o;
  }

  var dpr=Math.min(devicePixelRatio||1, 2);
  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);
  }
  resize();addEventListener("resize",resize,{passive:true});

  // View: camera pulled back looking at robot centered ~y=0.15
  trans(mView,0,-0.18,-3.80);

  var section=document.querySelector(".agent-section");
  var sectionVisible=true, frameId=0;
  function shouldRender(){return !document.hidden&&sectionVisible;}
  function schedule(){if(!frameId&&shouldRender())frameId=requestAnimationFrame(frame);}
  document.addEventListener("visibilitychange",schedule);
  if(section&&"IntersectionObserver" in window){
    sectionVisible=false;
    new IntersectionObserver(function(entries){
      sectionVisible=entries.some(function(entry){return entry.isIntersecting;});
      schedule();
    },{rootMargin:"240px 0px"}).observe(section);
  }

  var t0=performance.now();
  function frame(now){
    frameId=0;
    if(!shouldRender())return;
    var t=(now-t0)/1000;
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);

    for(var b=0;b<bots.length;b++){
      var bot=bots[b], el=bot.el, r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight||r.width<4) continue;             // offscreen cull
      var px=Math.floor(r.left*dpr), pw=Math.floor(r.width*dpr),
          ph=Math.floor(r.height*dpr), py=Math.floor((innerHeight-r.bottom)*dpr);
      gl.viewport(px,py,pw,ph); gl.scissor(px,py,pw,ph);
      gl.clear(gl.DEPTH_BUFFER_BIT);

      bot.hover += (bot.hoverT-bot.hover)*0.12;
      var asp=pw/Math.max(1,ph);
      persp(mProj,0.62,asp,0.1,20);

      // Each worker reacts at its own tempo while pointer influence stays subtle.
      var profile=bot.profile;
      var ccx=r.left+r.width/2, ccy=r.top+r.height*0.42;
      var yaw=reduced?0:((mx-ccx)/innerWidth)*profile.pointerYaw + Math.sin(t*profile.yawSpeed+bot.phase)*profile.yawAmp;
      var pitch=reduced?0:(-(my-ccy)/innerHeight)*profile.pointerPitch;
      var bob=reduced?0:Math.sin(t*profile.bobSpeed+bot.phase)*profile.bobAmp*(1.0+bot.hover*0.6);
      if(b===2) bob-=Math.max(0,Math.sin(t*.78+bot.phase))*0.028;
      var roll=reduced?0:Math.sin(t*profile.rollSpeed+bot.phase)*profile.roll;
      var sc=1.0+bot.hover*0.10;

      rotY(mRy,yaw); rotX(mRx,pitch); rotZ(mRz,roll);
      mul(mLocal,mRy,mRx); mul(mRobot,mRz,mLocal);
      // Body proportions are part of the identity, not just color variants.
      trans(mT,0,bob,0); scale(mS,sc*profile.scale[0],sc*profile.scale[1],sc*profile.scale[2]);
      mul(mTmp,mT,mS); mul(mRobot,mRobot,mTmp);
      normalFromRot(nm,mRobot);
      gl.uniformMatrix3fv(uNM,false,nm);
      gl.uniform3fv(uAccent,bot.acc);
      var pulse=0.6+0.4*Math.sin(t*(profile.pulse+bot.hover*2.0)+bot.phase);
      var emisK=(0.9+pulse*0.9)*(1.0+bot.hover*0.8);

      var parts=profile.parts;
      for(var p=0;p<parts.length;p++){
        var part=parts[p], px0=part[0], py0=part[1], pz0=part[2],
            sx0=part[3], sy0=part[4], sz0=part[5], rx0=part[8], ry0=part[9], rz0=part[10], motion=part[11];
        if(motion===1){rz0+=Math.sin(t*4.6+bot.phase+(px0>0?1.2:0))*0.08;}
        if(motion===2){
          var orbit=t*.16, ox=px0, oy=py0-.67;
          px0=ox*Math.cos(orbit)-oy*Math.sin(orbit);
          py0=.67+ox*Math.sin(orbit)+oy*Math.cos(orbit);
          rz0+=orbit;
        }
        if(motion===3){rz0+=Math.sin(t*1.35+bot.phase)*.12;}
        if(motion===4){
          var signal=.82+.18*Math.sin(t*5.4+py0*8.0);
          sx0*=signal; py0+=Math.sin(t*4.1+py0*6.0)*.018;
        }
        if(motion===5){sx0*=.92+.12*Math.sin(t*2.8);sy0*=.92+.12*Math.sin(t*2.8);}

        trans(mT,px0,py0,pz0); scale(mS,sx0,sy0,sz0);
        rotX(mRx,rx0); rotY(mRy,ry0); rotZ(mRz,rz0);
        mul(mLocal,mRz,mRy); mul(mLocal2,mLocal,mRx); mul(mLocal,mLocal2,mS); mul(mPart,mT,mLocal);
        mul(mPart,mRobot,mPart);    // robot * part
        mul(mTmp,mView,mPart);
        mul(mMVP,mProj,mTmp);
        gl.uniformMatrix4fv(uMVP,false,mMVP);
        if(part[6]===1){ // emissive
          gl.uniform3f(uAlbedo,0.02,0.03,0.04);
          gl.uniform3fv(uEmis,bot.acc);
          gl.uniform1f(uEmisK,emisK);
        } else {
          gl.uniform3fv(uAlbedo,part[7]);
          gl.uniform3f(uEmis,0,0,0);
          gl.uniform1f(uEmisK,0);
        }
        gl.drawArrays(gl.TRIANGLES,0,36);
      }
    }
    frameId=requestAnimationFrame(frame);
  }
  schedule();
})();
