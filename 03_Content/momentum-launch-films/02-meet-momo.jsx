const W=1920,H=1080;
const PAPER="#F4F6F8", WHITE="#FFFFFF", INK="#0F1720", MUT="#78889A", FAINT="#B4BEC9",
      BLUE="#2A80C2", BLUEI="#2673AF", GOLD="#FFC63B", DEEP="#0E1622", RULE="#E2E8EF",
      CHIP="#EDF1F5", BLACK="#141A21", GREY="#EAEEF2", GREEN="#2E7D6B";
const DISP="Archivo Black", UI="Nunito Sans";
const R=Math.round;

const bg=(f)=><rect name="bg" x={0} y={0} width={W} height={H} fill={f} />;
const up=(t,d=0.4,y=22)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+d,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:y},{at:t+d+0.12,value:0,easing:"house"}]}];
const pop=(t)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+0.18,value:1}]},
  {property:"scale", keyframes:[{at:t,value:0.74},{at:t+0.28,value:1.04,easing:"house"},{at:t+0.42,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:16},{at:t+0.4,value:0,easing:"house"}]}];
const blink=(...ts)=>[{property:"scaleY", keyframes:ts.flatMap(t=>[
  {at:t,value:1},{at:t+0.07,value:0.08,easing:"house"},{at:t+0.16,value:1,easing:"house"}])}];

// ---- MOMO: the Momentum bot. Blue body, white eyes, gold antenna.
// One <group> so pops, bobs and tilts move the whole character together.
const momo=(k,cx,cy,s,anim,eyeAnim)=>{
  const w=R(268*s), h=R(246*s), rad=R(116*s);
  const sw=Math.max(4,R(13*s)), sh=R(28*s), dt=Math.max(6,R(24*s));
  const top=sh+dt, gw=w, gh=h+top;
  const ew=Math.max(5,R(32*s)), eh=Math.max(9,R(56*s)), er=Math.max(2,R(16*s));
  return (
    <group name={k} x={R(cx-gw/2)} y={R(cy-gh/2)} width={gw} height={gh} animate={anim}>
      <rect name={k+"d"} x={R(w/2-dt/2)} y={0} width={dt} height={dt} radius={R(dt/2)} fill={GOLD} />
      <rect name={k+"s"} x={R(w/2-sw/2)} y={R(dt-2)} width={sw} height={R(sh+6)} radius={R(sw/2)} fill={BLUE} />
      <rect name={k+"b"} x={0} y={top} width={w} height={h} radius={rad} fill={BLUE} />
      <rect name={k+"1"} x={R(w*0.31-ew/2)} y={R(top+h*0.34)} width={ew} height={eh} radius={er} fill={WHITE} animate={eyeAnim} />
      <rect name={k+"2"} x={R(w*0.69-ew/2)} y={R(top+h*0.34)} width={ew} height={eh} radius={er} fill={WHITE} animate={eyeAnim} />
    </group>
  );
};

// ---- chat bubbles inside the phone
const PX=640, PW=640, PL=PX+34, PR=PX+PW-34;
const bub=(k,side,y,txt,t)=>{
  const w=Math.min(510, R(48+txt.length*12.6));
  const x = side==="in" ? PL : PR-w;
  return [
    <rect name={k+"b"} x={x} y={y} width={w} height={64} radius={32} fill={side==="in"?GREY:BLUE} animate={pop(t)} />,
    <text name={k+"x"} x={x} y={y+18} width={w} align="center" fontFamily={UI} fontSize={26} fontWeight={600}
      color={side==="in"?INK:WHITE} animate={pop(t)}>{txt}</text>,
  ];
};
const card=(k,y,name,state,tint,t)=>[
  <rect name={k+"c"} x={PL} y={y} width={PR-PL} height={94} radius={18} fill={WHITE}
    strokeWidth={2} strokeColor={RULE} animate={pop(t)} />,
  <rect name={k+"i"} x={PL+18} y={y+23} width={48} height={48} radius={13} fill={tint} animate={pop(t)} />,
  <text name={k+"n"} x={PL+82} y={y+22} width={320} fontFamily={UI} fontSize={25} fontWeight={800} color={INK}
    animate={pop(t)}>{name}</text>,
  <text name={k+"s"} x={PL+82} y={y+53} width={320} fontFamily={UI} fontSize={21} fontWeight={600} color={MUT}
    animate={pop(t)}>{state}</text>,
  <text name={k+"g"} x={PR-150} y={y+35} width={130} align="right" fontFamily={UI} fontSize={22} fontWeight={800} color={BLUEI}
    animate={pop(t)}>Momo</text>,
];

export default async ({project}) => {
  const p = await project({dir:"proj", size:"1920x1080", fps:30, background:WHITE});
  const mm = await p.add("src/mm.png");

  /* ---------- A. hello ---------- */
  p.compose([ bg(WHITE),
    <rect name="hb" x={1074} y={278} width={280} height={74} radius={37} fill={GREY} animate={pop(0.9)} />,
    <text name="ht" x={1074} y={299} width={280} align="center" fontFamily={UI} fontSize={28} fontWeight={600} color={INK}
      animate={pop(0.95)}>spend check?</text>,
    momo("m0", 900, 552, 1.5,
      [{property:"opacity", keyframes:[{at:0.15,value:0},{at:0.45,value:1}]},
       {property:"scale", keyframes:[{at:0.15,value:0.5},{at:0.7,value:1.06,easing:"house"},{at:0.95,value:1}]},
       {property:"offsetY", keyframes:[{at:1.0,value:0},{at:1.7,value:-18,easing:"house"},{at:2.4,value:0,easing:"house"},{at:3.1,value:-11,easing:"house"},{at:3.7,value:0,easing:"house"}]}],
      blink(1.6,2.9)),
    <text name="c0" x={0} y={868} width={W} align="center" fontFamily={UI} fontSize={40} fontWeight={700} color={MUT}
      animate={up(2.3,0.45,20)}>Momentum built a bot. It watches the money.</text>,
  ], {at:0, dur:4.4, name:"A-hello"});

  /* ---------- the phone, reused ---------- */
  const phone=()=>[
    <rect name="ph" x={PX} y={40} width={PW} height={1180} radius={78} fill={WHITE}
      strokeWidth={9} strokeColor="#DCE3EA" shadow={{x:0,y:20,blur:60,color:"rgba(15,23,32,0.14)"}}
      animate={[{property:"opacity", keyframes:[{at:0,value:0},{at:0.35,value:1}]},
                {property:"offsetY", keyframes:[{at:0,value:64},{at:0.8,value:0,easing:"house"}]}]} />,
    <rect name="notch" x={R(PX+PW/2-84)} y={64} width={168} height={30} radius={15} fill="#12181F"
      animate={[{property:"opacity", keyframes:[{at:0.2,value:0},{at:0.5,value:1}]}]} />,
    <rect name="hdr" x={PX+9} y={120} width={PW-18} height={116} fill="#F7F9FB"
      animate={[{property:"opacity", keyframes:[{at:0.3,value:0},{at:0.6,value:1}]}]} />,
    momo("mh", R(PX+PW/2), 172, 0.30,
      [{property:"opacity", keyframes:[{at:0.4,value:0},{at:0.7,value:1}]}], blink(2.6)),
    <text name="hn" x={PX} y={210} width={PW} align="center" fontFamily={UI} fontSize={22} fontWeight={800} color={INK}
      animate={[{property:"opacity", keyframes:[{at:0.5,value:0},{at:0.8,value:1}]}]}>Momo</text>,
    <rect name="hrl" x={PX+9} y={236} width={PW-18} height={2} fill={RULE}
      animate={[{property:"opacity", keyframes:[{at:0.5,value:0},{at:0.8,value:1}]}]} />,
  ];

  /* ---------- B. the thread ---------- */
  p.compose([ bg(WHITE), ...phone(),
    ...bub("q1","in", 306,"cost per lead crossed $60",1.0),
    ...bub("q2","out",404,"im busy today",1.9),
    ...bub("q3","in", 502,"already moved. it's $41 now.",2.7),
    ...bub("q4","out",600,"…ok",3.6),
    ...bub("q5","in", 698,"i'm not going anywhere.",4.3),
    <text name="side1" x={110} y={420} width={470} fontFamily={DISP} fontSize={76} color={INK}
      animate={up(1.4,0.5,26)}>Always on.</text>,
    <text name="side2" x={110} y={536} width={470} fontFamily={UI} fontSize={30} fontWeight={600} color={MUT}
      animate={up(1.8,0.5,20)}>Momo checks Google, Meta and the assistants every day, and tells you before you have to ask.</text>,
  ], {at:4.4, dur:5.6, name:"B-thread"});

  /* ---------- C. what it is handling ---------- */
  p.compose([ bg(WHITE), ...phone(),
    <text name="ch" x={PL} y={288} width={R(PR-PL)} fontFamily={UI} fontSize={23} fontWeight={800} letterSpacing={3} color={MUT}
      animate={up(0.4,0.4,14)}>HANDLED TODAY</text>,
    ...card("k1",332,"Google Ads","budgets and bids", BLUE, 0.7),
    ...card("k2",442,"Meta Ads","creative rotation", BLUEI, 0.95),
    ...card("k3",552,"ChatGPT and Perplexity","answer coverage", BLACK, 1.2),
    ...card("k4",662,"Local SEO","maps and citations", GOLD, 1.45),
    ...card("k5",772,"Leads","matched to real names", GREEN, 1.7),
    <text name="s1" x={110} y={352} width={500} fontFamily={DISP} fontSize={78} color={INK}
      animate={up(1.0,0.5,26)}>Ads.</text>,
    <text name="s1b" x={110} y={446} width={500} fontFamily={DISP} fontSize={78} color={INK}
      animate={up(1.18,0.5,26)}>Answers.</text>,
    <text name="s2" x={110} y={540} width={500} fontFamily={DISP} fontSize={78} color={BLUEI}
      animate={up(1.36,0.5,26)}>Attribution.</text>,
    <rect name="s3" x={110} y={664} width={220} height={7} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:220,height:20}}
      animate={[{property:"maskWidth", keyframes:[{at:1.8,value:0},{at:2.4,value:220,easing:"house"}]}]} />,
    <text name="s4" x={110} y={708} width={500} fontFamily={UI} fontSize={30} fontWeight={600} color={MUT}
      animate={up(2.1,0.5,20)}>One bot. One thread. No dashboard homework.</text>,
  ], {at:10.0, dur:5.6, name:"C-cards"});

  /* ---------- D. the swap ---------- */
  p.compose([ bg(WHITE),
    <text name="w1" x={0} y={452} width={W} align="center" fontFamily={UI} fontSize={80} fontWeight={800} color={FAINT}
      animate={[{property:"opacity", keyframes:[{at:0.3,value:0},{at:0.8,value:1},{at:2.0,value:1},{at:2.35,value:0}]},
                {property:"blur", keyframes:[{at:2.0,value:0},{at:2.35,value:14}]}]}>most agencies send a report</text>,
    <text name="w2" x={0} y={452} width={W} align="center" fontFamily={UI} fontSize={80} fontWeight={800} color={INK}
      animate={[{property:"opacity", keyframes:[{at:2.3,value:0},{at:2.75,value:1}]},
                {property:"blur", keyframes:[{at:2.3,value:16},{at:2.8,value:0}]},
                {property:"offsetY", keyframes:[{at:2.3,value:20},{at:2.9,value:0,easing:"house"}]}]}>Momo just sends a message</text>,
    momo("m2", 960, 736, 0.44,
      [{property:"opacity", keyframes:[{at:2.7,value:0},{at:3.0,value:1}]},
       {property:"scale", keyframes:[{at:2.7,value:0.5},{at:3.15,value:1.08,easing:"house"},{at:3.4,value:1}]}],
      blink(3.6)),
  ], {at:15.6, dur:4.2, name:"D-swap"});

  /* ---------- E. portrait ---------- */
  p.compose([ bg(PAPER),
    momo("m3", 960, 450, 2.0,
      [{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.45,value:1}]},
       {property:"scale", keyframes:[{at:0.1,value:0.78},{at:0.8,value:1,easing:"house"}]},
       {property:"rotation", keyframes:[{at:0.9,value:0},{at:1.7,value:-4,easing:"house"},{at:2.6,value:4,easing:"house"},{at:3.4,value:0,easing:"house"}]}],
      blink(1.2,2.7)),
    <text name="pc" x={0} y={782} width={W} align="center" fontFamily={DISP} fontSize={92} color={INK}
      animate={up(1.3,0.5,26)}>Meet Momo.</text>,
    <text name="pd" x={0} y={908} width={W} align="center" fontFamily={UI} fontSize={38} fontWeight={600} color={MUT}
      animate={up(1.7,0.5,20)}>The bot that runs your ads inside ChatGPT.</text>,
  ], {at:19.8, dur:4.4, name:"E-portrait"});

  /* ---------- F. lockup ---------- */
  p.compose([ bg(PAPER),
    <group name="lock" x={806} y={206} width={308} height={308}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.45,value:1}]},
                {property:"rotation", keyframes:[{at:0.1,value:-200},{at:1.3,value:0,easing:"house"}]},
                {property:"scale", keyframes:[{at:0.1,value:0.35},{at:1.1,value:1.06,easing:"house"},{at:1.4,value:1}]}]}>
      <rect name="disc" x={0} y={0} width={308} height={308} radius={154} fill={WHITE} />
      <media name="lm" file={mm} x={0} y={0} width={308} />
    </group>,
    <text name="wmk" x={0} y={560} width={W} align="center" fontFamily={DISP} fontSize={116} color={INK}
      animate={up(1.05,0.45,26)}>Momentum</text>,
    <rect name="grl" x={860} y={702} width={200} height={7} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:200,height:20}}
      animate={[{property:"maskWidth", keyframes:[{at:1.45,value:0},{at:2.05,value:200,easing:"house"}]}]} />,
    momo("m4", 706, 792, 0.36,
      [{property:"opacity", keyframes:[{at:1.6,value:0},{at:1.9,value:1}]},
       {property:"scale", keyframes:[{at:1.6,value:0.5},{at:2.05,value:1.08,easing:"house"},{at:2.3,value:1}]}],
      blink(3.0)),
    <text name="tag" x={790} y={766} width={520} fontFamily={UI} fontSize={40} fontWeight={700} color={MUT}
      animate={up(1.75,0.45,20)}>say hi to Momo</text>,
    <text name="dom" x={0} y={888} width={W} align="center" fontFamily={UI} fontSize={28} fontWeight={800} letterSpacing={4} color={BLUEI}
      animate={up(2.15,0.45,16)}>NEEDMOMENTUM.COM</text>,
  ], {at:24.2, dur:4.8, name:"F-lockup"});

  await p.render("renders/f2.mp4", {quality:"final"});
};
