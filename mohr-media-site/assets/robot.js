/* =====================================================================
   CREW — solid-mesh 3D robot renderer (raw WebGL, no libraries)
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

  /* ---------- robot part list: [px,py,pz, sx,sy,sz, kind] kind:0 body 1 emissive ---------- */
  var METAL=[0.085,0.098,0.115], DARK=[0.055,0.062,0.075];
  var PARTS=[
    [0,0.02,0, 0.62,0.72,0.44, 0, METAL],       // torso
    [0,-0.05,0.19, 0.34,0.30,0.06, 1, null],    // chest core (emissive)
    [0,0.66,0, 0.52,0.44,0.46, 0, METAL],       // head
    [0,0.70,0.20, 0.40,0.12,0.06, 1, null],     // visor (emissive)
    [0,1.02,0, 0.05,0.30,0.05, 0, DARK],        // antenna stalk
    [0,1.22,0, 0.11,0.11,0.11, 1, null],        // antenna tip (emissive)
    [-0.50,0.10,0, 0.16,0.52,0.18, 0, DARK],    // left arm
    [0.50,0.10,0, 0.16,0.52,0.18, 0, DARK],     // right arm
    [-0.50,-0.20,0, 0.20,0.14,0.22, 0, METAL],  // left hand
    [0.50,-0.20,0, 0.20,0.14,0.22, 0, METAL],   // right hand
    [-0.40,0.40,0, 0.26,0.16,0.26, 0, METAL],   // left shoulder
    [0.40,0.40,0, 0.26,0.16,0.26, 0, METAL],    // right shoulder
    [0,-0.62,0, 0.30,0.16,0.26, 0, DARK]        // hips
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
    return {el:el, acc:acc, hover:0, hoverT:0, phase:i*1.7};
  });
  slots.forEach(function(el,i){
    var hot = el.closest ? (el.closest(".agent") || el) : el;
    hot.addEventListener("mouseenter",function(){bots[i].hoverT=1;});
    hot.addEventListener("mouseleave",function(){bots[i].hoverT=0;});
  });

  /* scratch matrices */
  var mProj=new Float32Array(16),mView=new Float32Array(16),mRobot=new Float32Array(16),
      mPart=new Float32Array(16),mTmp=new Float32Array(16),mMVP=new Float32Array(16),
      mT=new Float32Array(16),mS=new Float32Array(16),mRy=new Float32Array(16),mRx=new Float32Array(16),
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
  trans(mView,0,-0.18,-3.15);

  var t0=performance.now();
  function frame(now){
    requestAnimationFrame(frame);
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

      // robot orientation: idle bob + yaw/pitch toward cursor (relative to slot center)
      var ccx=r.left+r.width/2, ccy=r.top+r.height*0.42;
      var yaw=reduced?0:( (mx-ccx)/innerWidth )*1.3 + Math.sin(t*0.5+bot.phase)*0.12;
      var pitch=reduced?0:(-(my-ccy)/innerHeight)*0.5;
      var bob=reduced?0:Math.sin(t*1.1+bot.phase)*0.05*(1.0+bot.hover*0.6);
      var sc=1.0+bot.hover*0.10;

      rotY(mRy,yaw); rotX(mRx,pitch); mul(mRobot,mRy,mRx);
      // apply bob translation + uniform scale into robot matrix via post-multiply of a T*S
      trans(mT,0,bob,0); scale(mS,sc,sc,sc); mul(mTmp,mT,mS); mul(mRobot,mRobot,mTmp);
      normalFromRot(nm,mRobot);
      gl.uniformMatrix3fv(uNM,false,nm);
      gl.uniform3fv(uAccent,bot.acc);
      var pulse=0.6+0.4*Math.sin(t*(2.2+bot.hover*2.0)+bot.phase);
      var emisK=(0.9+pulse*0.9)*(1.0+bot.hover*0.8);

      for(var p=0;p<PARTS.length;p++){
        var P=PARTS[p];
        trans(mT,P[0],P[1],P[2]); scale(mS,P[3],P[4],P[5]);
        mul(mPart,mT,mS);           // local part TRS
        mul(mPart,mRobot,mPart);    // robot * part
        mul(mTmp,mView,mPart);
        mul(mMVP,mProj,mTmp);
        gl.uniformMatrix4fv(uMVP,false,mMVP);
        if(P[6]===1){ // emissive
          gl.uniform3f(uAlbedo,0.02,0.03,0.04);
          gl.uniform3fv(uEmis,bot.acc);
          gl.uniform1f(uEmisK,emisK);
        } else {
          gl.uniform3fv(uAlbedo,P[7]);
          gl.uniform3f(uEmis,0,0,0);
          gl.uniform1f(uEmisK,0);
        }
        gl.drawArrays(gl.TRIANGLES,0,36);
      }
    }
  }
  requestAnimationFrame(frame);
})();
