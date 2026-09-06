const W=1920,H=1080;
const PAPER="#F4F6F8", WHITE="#FFFFFF", INK="#0F1720", MUT="#78889A", FAINT="#AEB8C4",
      BLUE="#2A80C2", BLUEI="#2673AF", GOLD="#FFC63B", DEEP="#0E1622", RULE="#E2E8EF",
      CHIP="#EAF0F6", BLACK="#141A21";
const DISP="Archivo Black", UI="Nunito Sans";

const bg=(f)=><rect name="bg" x={0} y={0} width={W} height={H} fill={f} />;
const up=(t,d=0.42,y=24)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+d,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:y},{at:t+d+0.12,value:0,easing:"house"}]}];
const fade=(a,b)=>[{property:"opacity", keyframes:[{at:a,value:0},{at:a+0.3,value:1},{at:b,value:1},{at:b+0.35,value:0}]}];
// a floating capsule chip: rect + label, animated together
const chip=(k,x,y,label,fill,color,anim)=>{
  const w = Math.round(label.length*12.2)+46;
  return [
    <rect name={k+"r"} x={x} y={y} width={w} height={46} radius={23} fill={fill} animate={anim} />,
    <text name={k+"t"} x={x} y={y+12} width={w} align="center" fontFamily={UI} fontSize={22}
      fontWeight={800} color={color} animate={anim}>{label}</text>,
  ];
};
const drift=(t,dx,dy,life)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+0.3,value:1},{at:life,value:1},{at:life+0.4,value:0}]},
  {property:"offsetX", keyframes:[{at:t,value:dx},{at:t+1.2,value:0,easing:"house"}]},
  {property:"offsetY", keyframes:[{at:t,value:dy},{at:t+1.2,value:0,easing:"house"}]},
];

export default async ({project}) => {
  const p = await project({dir:"proj", size:"1920x1080", fps:30, background:PAPER});
  const mm  = await p.add("src/mm.png");
  const oai = await p.add("src/openai.png");

  /* ---------- A. kinetic wordmark ---------- */
  p.compose([ bg(PAPER),
    <text name="intro" x={0} y={512} width={W} align="center" fontFamily={UI} fontSize={30}
      fontWeight={800} letterSpacing={3} color={INK}
      animate={[{property:"textProgress", keyframes:[{at:0.3,value:0},{at:1.0,value:1,easing:"linear"}]},
                {property:"opacity", keyframes:[{at:0.25,value:0},{at:0.4,value:1},{at:1.5,value:1},{at:1.8,value:0}]}]}>Introducing</text>,
    <rect name="dot" x={928} y={496} width={64} height={64} radius={32} fill={INK}
      animate={[{property:"opacity", keyframes:[{at:1.6,value:0},{at:1.8,value:1},{at:2.3,value:1},{at:2.45,value:0}]},
                {property:"scale", keyframes:[{at:1.7,value:0.2},{at:2.05,value:1,easing:"house"}]}]} />,
    <text name="kw" x={0} y={402} width={5400} align="left" fontFamily={DISP} fontSize={216} color={INK}
      animate={[{property:"opacity", keyframes:[{at:2.2,value:0},{at:2.35,value:1},{at:4.75,value:1},{at:4.95,value:0}]},
                {property:"offsetX", keyframes:[{at:2.2,value:2050},{at:3.3,value:520,easing:"house"},{at:4.95,value:-2350,easing:"house"}]}]}>MOMENTUM FOR CHATGPT ADS</text>,
    ...chip("c1", 190, 300, "Google Ads", BLUE, WHITE, drift(2.5,-160,-70,4.5)),
    ...chip("c2", 1480, 268, "Meta", BLUEI, WHITE, drift(2.75,190,-60,4.5)),
    ...chip("c3", 250, 770, "SEO", GOLD, INK, drift(3.0,-150,90,4.5)),
    ...chip("c4", 1560, 792, "AEO", GOLD, INK, drift(3.2,180,80,4.5)),
    ...chip("c5", 830, 838, "GEO", BLACK, WHITE, drift(3.45,0,120,4.5)),
    ...chip("c6", 1180, 214, "ChatGPT", BLACK, WHITE, drift(3.65,120,-90,4.5)),
  ], {at:0, dur:5.0, name:"A-wordmark"});

  /* ---------- B. the prompt bar ---------- */
  const Q="cut my cost per lead and keep the leads real";
  p.compose([ bg(PAPER),
    <rect name="bar" x={410} y={438} width={1100} height={186} radius={30} fill={WHITE}
      strokeWidth={2} strokeColor={RULE} shadow={{x:0,y:16,blur:48,color:"rgba(15,23,32,0.12)"}}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.5,value:1}]},
                {property:"offsetY", keyframes:[{at:0.1,value:34},{at:0.75,value:0,easing:"house"}]}]} />,
    <text name="typed" x={462} y={484} width={960} fontFamily={UI} fontSize={40} fontWeight={400} color={INK}
      animate={[{property:"textProgress", keyframes:[{at:0.9,value:0},{at:3.0,value:1,easing:"linear"}]},
                {property:"opacity", keyframes:[{at:0.85,value:0},{at:0.95,value:1}]}]}>{Q}</text>,
    <rect name="i1" x={462} y={560} width={30} height={30} radius={15} fill={CHIP}
      animate={[{property:"opacity", keyframes:[{at:0.5,value:0},{at:0.8,value:1}]}]} />,
    <rect name="i2" x={506} y={560} width={30} height={30} radius={15} fill={CHIP}
      animate={[{property:"opacity", keyframes:[{at:0.55,value:0},{at:0.85,value:1}]}]} />,
    <rect name="i3" x={550} y={560} width={30} height={30} radius={15} fill={CHIP}
      animate={[{property:"opacity", keyframes:[{at:0.6,value:0},{at:0.9,value:1}]}]} />,
    <rect name="send" x={1382} y={528} width={72} height={72} radius={36} fill={BLUE}
      animate={[{property:"opacity", keyframes:[{at:0.6,value:0},{at:0.9,value:1}]},
                {property:"scale", keyframes:[{at:3.15,value:1},{at:3.3,value:0.84,easing:"house"},{at:3.5,value:1.04},{at:3.65,value:1}]}]} />,
    <path name="arw" x={1400} y={546} width={36} height={36} d="M 18 34 L 18 4 M 5 17 L 18 4 L 31 17"
      fill={null} stroke={{color:WHITE,width:5}}
      animate={[{property:"opacity", keyframes:[{at:0.7,value:0},{at:1.0,value:1}]},
                {property:"scale", keyframes:[{at:3.15,value:1},{at:3.3,value:0.84,easing:"house"},{at:3.5,value:1.04},{at:3.65,value:1}]}]} />,
    <rect name="gp" x={1098} y={654} width={200} height={54} radius={27} fill={BLACK} animate={up(3.5,0.35,16)} />,
    <media name="gi" file={oai} x={1124} y={667} width={28} animate={up(3.55,0.35,16)} />,
    <text name="gt" x={1162} y={668} width={130} fontFamily={UI} fontSize={23} fontWeight={800} color={WHITE}
      animate={up(3.55,0.35,16)}>ChatGPT</text>,
    <rect name="mp" x={1314} y={654} width={196} height={54} radius={27} fill={BLUE} animate={up(3.75,0.35,16)} />,
    <media name="mi" file={mm} x={1336} y={665} width={32} animate={up(3.8,0.35,16)} />,
    <text name="mt" x={1376} y={668} width={130} fontFamily={UI} fontSize={23} fontWeight={800} color={WHITE}
      animate={up(3.8,0.35,16)}>Momentum</text>,
    <text name="cap" x={0} y={824} width={W} align="center" fontFamily={UI} fontSize={38} fontWeight={700} color={MUT}
      animate={up(4.0,0.45,20)}>You already talk to it. Now it runs the account.</text>,
  ], {at:5.0, dur:5.4, name:"B-prompt"});

  /* ---------- C. what it actually does ---------- */
  const ROWS=[
    ["Running the ads.","Google and Meta, managed daily inside the chat.",BLUE],
    ["Owning the answer.","AEO, SEO and GEO so the assistants name you.",GOLD],
    ["Matching the money.","Named leads, not platform conversion totals.",BLACK],
  ];
  p.compose([ bg(PAPER),
    ...ROWS.flatMap(([t,s,c],i)=>[
      <rect name={"d"+i} x={362} y={306+i*152} width={18} height={18} radius={9} fill={c}
        animate={up(0.35+i*0.28,0.3,0)} />,
      <text name={"t"+i} x={410} y={288+i*152} width={1180} fontFamily={UI} fontSize={46} fontWeight={800} color={INK}
        animate={up(0.4+i*0.28,0.4,18)}>{t}</text>,
      <text name={"s"+i} x={410} y={350+i*152} width={1180} fontFamily={UI} fontSize={29} fontWeight={400} color={MUT}
        animate={up(0.55+i*0.28,0.4,14)}>{s}</text>,
      <path name={"u"+i} x={410} y={392+i*152} width={300} height={5} d="M 0 2 C 120 2, 190 2, 300 2"
        fill={null} stroke={{color:c,width:4}} mask={{shape:"rectangle",x:0,y:-8,width:300,height:20}}
        animate={[{property:"maskWidth", keyframes:[{at:1.4+i*0.28,value:0},{at:2.2+i*0.28,value:300,easing:"house"}]}]} />,
    ]),
    <rect name="rule" x={362} y={800} width={1196} height={2} fill={RULE} animate={up(2.6,0.4,0)} />,
    <text name="pay" x={362} y={840} width={1300} fontFamily={UI} fontSize={44} fontWeight={800} color={INK}
      animate={up(2.9,0.45,20)}>One team runs the ads and the answers.</text>,
  ], {at:10.4, dur:5.0, name:"C-list"});

  /* ---------- D. the account, restyled ---------- */
  p.compose([ bg(PAPER),
    <rect name="win" x={430} y={214} width={1060} height={640} radius={20} fill={WHITE}
      strokeWidth={2} strokeColor={RULE} shadow={{x:0,y:24,blur:64,color:"rgba(15,23,32,0.14)"}}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.5,value:1}]},
                {property:"offsetY", keyframes:[{at:0.1,value:40},{at:0.85,value:0,easing:"house"}]},
                {property:"scale", keyframes:[{at:0.1,value:0.96},{at:0.85,value:1,easing:"house"}]}]} />,
    <rect name="chrome" x={430} y={214} width={1060} height={56} radius={20} fill={CHIP}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.5,value:1}]},
                {property:"offsetY", keyframes:[{at:0.1,value:40},{at:0.85,value:0,easing:"house"}]}]} />,
    <rect name="chromefix" x={430} y={244} width={1060} height={26} fill={CHIP}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.5,value:1}]},
                {property:"offsetY", keyframes:[{at:0.1,value:40},{at:0.85,value:0,easing:"house"}]}]} />,
    <rect name="dt1" x={456} y={234} width={16} height={16} radius={8} fill="#C9D3DD" animate={fade(0.45,5.2)} />,
    <rect name="dt2" x={480} y={234} width={16} height={16} radius={8} fill="#C9D3DD" animate={fade(0.5,5.2)} />,
    <rect name="dt3" x={504} y={234} width={16} height={16} radius={8} fill="#C9D3DD" animate={fade(0.55,5.2)} />,
    <rect name="url" x={700} y={230} width={520} height={26} radius={13} fill="#DDE5ED" animate={fade(0.5,5.2)} />,
    // light state
    <rect name="pane" x={432} y={270} width={1056} height={582} fill={WHITE}
      animate={[{property:"opacity", keyframes:[{at:0.4,value:0},{at:0.7,value:1},{at:2.5,value:1},{at:2.9,value:0}]}]} />,
    <text name="hl" x={498} y={352} width={800} fontFamily={DISP} fontSize={92} color={INK}
      animate={[{property:"opacity", keyframes:[{at:0.9,value:0},{at:1.2,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]}>CAMPAIGN</text>,
    <rect name="lr1" x={498} y={480} width={300} height={12} radius={6} fill="#E6ECF2"
      animate={[{property:"opacity", keyframes:[{at:1.1,value:0},{at:1.4,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lr2" x={498} y={512} width={420} height={12} radius={6} fill="#E6ECF2"
      animate={[{property:"opacity", keyframes:[{at:1.2,value:0},{at:1.5,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lb0" x={1000} y={610} width={46} height={90} radius={8} fill="#E3E9EF"
      animate={[{property:"opacity", keyframes:[{at:1.25,value:0},{at:1.50,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lb1" x={1070} y={560} width={46} height={140} radius={8} fill="#E3E9EF"
      animate={[{property:"opacity", keyframes:[{at:1.31,value:0},{at:1.56,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lb2" x={1140} y={590} width={46} height={110} radius={8} fill="#E3E9EF"
      animate={[{property:"opacity", keyframes:[{at:1.37,value:0},{at:1.62,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lb3" x={1210} y={518} width={46} height={182} radius={8} fill="#E3E9EF"
      animate={[{property:"opacity", keyframes:[{at:1.43,value:0},{at:1.68,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lb4" x={1280} y={550} width={46} height={150} radius={8} fill="#E3E9EF"
      animate={[{property:"opacity", keyframes:[{at:1.49,value:0},{at:1.74,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    <rect name="lb5" x={1350} y={486} width={46} height={214} radius={8} fill="#E3E9EF"
      animate={[{property:"opacity", keyframes:[{at:1.55,value:0},{at:1.80,value:1},{at:2.5,value:1},{at:2.85,value:0}]}]} />,
    // dark state
    <rect name="pane2" x={432} y={270} width={1056} height={582} fill={DEEP}
      animate={[{property:"opacity", keyframes:[{at:2.6,value:0},{at:3.0,value:1}]}]} />,
    <text name="dl" x={498} y={340} width={900} fontFamily={DISP} fontSize={92} color={WHITE}
      animate={[{property:"opacity", keyframes:[{at:2.9,value:0},{at:3.2,value:1}]},
                {property:"offsetY", keyframes:[{at:2.9,value:18},{at:3.35,value:0,easing:"house"}]}]}>CAMPAIGN</text>,
    <text name="dl2" x={498} y={440} width={900} fontFamily={DISP} fontSize={92} color={GOLD}
      animate={[{property:"opacity", keyframes:[{at:3.1,value:0},{at:3.4,value:1}]},
                {property:"offsetY", keyframes:[{at:3.1,value:18},{at:3.55,value:0,easing:"house"}]}]}>LIVE</text>,
    <rect name="grule" x={498} y={572} width={360} height={8} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:360,height:22}}
      animate={[{property:"maskWidth", keyframes:[{at:3.4,value:0},{at:4.1,value:360,easing:"house"}]}]} />,
    <text name="dsub" x={498} y={608} width={820} fontFamily={UI} fontSize={30} fontWeight={700} color="#9BB0C4"
      animate={[{property:"opacity", keyframes:[{at:3.6,value:0},{at:3.95,value:1}]}]}>Budgets, bids and answer coverage — handled.</text>,
    <rect name="db0" x={1000} y={610} width={46} height={90} radius={8} fill="#3E8FCB"
      animate={[{property:"opacity", keyframes:[{at:3.30,value:0},{at:3.50,value:1}]},
                {property:"scaleY", keyframes:[{at:3.30,value:0.1},{at:3.85,value:1,easing:"house"}]}]} />,
    <rect name="db1" x={1070} y={560} width={46} height={140} radius={8} fill="#3E8FCB"
      animate={[{property:"opacity", keyframes:[{at:3.37,value:0},{at:3.57,value:1}]},
                {property:"scaleY", keyframes:[{at:3.37,value:0.1},{at:3.92,value:1,easing:"house"}]}]} />,
    <rect name="db2" x={1140} y={590} width={46} height={110} radius={8} fill="#3E8FCB"
      animate={[{property:"opacity", keyframes:[{at:3.44,value:0},{at:3.64,value:1}]},
                {property:"scaleY", keyframes:[{at:3.44,value:0.1},{at:3.99,value:1,easing:"house"}]}]} />,
    <rect name="db3" x={1210} y={518} width={46} height={182} radius={8} fill="#3E8FCB"
      animate={[{property:"opacity", keyframes:[{at:3.51,value:0},{at:3.71,value:1}]},
                {property:"scaleY", keyframes:[{at:3.51,value:0.1},{at:4.06,value:1,easing:"house"}]}]} />,
    <rect name="db4" x={1280} y={550} width={46} height={150} radius={8} fill="#FFC63B"
      animate={[{property:"opacity", keyframes:[{at:3.58,value:0},{at:3.78,value:1}]},
                {property:"scaleY", keyframes:[{at:3.58,value:0.1},{at:4.13,value:1,easing:"house"}]}]} />,
    <rect name="db5" x={1350} y={486} width={46} height={214} radius={8} fill="#FFC63B"
      animate={[{property:"opacity", keyframes:[{at:3.65,value:0},{at:3.85,value:1}]},
                {property:"scaleY", keyframes:[{at:3.65,value:0.1},{at:4.20,value:1,easing:"house"}]}]} />,
    <media name="wm" file={mm} x={1348} y={306} width={82}
      animate={[{property:"opacity", keyframes:[{at:3.3,value:0},{at:3.6,value:1}]},
                {property:"scale", keyframes:[{at:3.3,value:0.5},{at:3.75,value:1.08,easing:"house"},{at:3.95,value:1}]}]} />,
    // status chips outside the window
    ...chip("s1", 214, 300, "Momentum is optimizing", BLACK, WHITE, drift(1.4,-90,0,5.2)),
    ...chip("s2", 1512, 402, "budget shifted", BLUE, WHITE, drift(2.0,110,0,5.2)),
    ...chip("s3", 236, 742, "answers indexed", GOLD, INK, drift(3.4,-90,40,5.2)),
    ...chip("s4", 1546, 700, "leads named", BLACK, WHITE, drift(4.0,110,40,5.2)),
  ], {at:15.4, dur:5.6, name:"D-window"});

  /* ---------- E. lockup ---------- */
  p.compose([ bg(PAPER),
    <group name="lock" x={806} y={228} width={308} height={308}
      animate={[{property:"opacity", keyframes:[{at:0.15,value:0},{at:0.5,value:1}]},
                {property:"rotation", keyframes:[{at:0.15,value:-200},{at:1.35,value:0,easing:"house"}]},
                {property:"scale", keyframes:[{at:0.15,value:0.35},{at:1.15,value:1.06,easing:"house"},{at:1.45,value:1}]}]}>
      <rect name="disc" x={0} y={0} width={308} height={308} radius={154} fill={WHITE} />
      <media name="lm" file={mm} x={0} y={0} width={308} />
    </group>,
    <text name="wmk" x={0} y={588} width={W} align="center" fontFamily={DISP} fontSize={116} color={INK}
      animate={up(1.1,0.45,26)}>Momentum</text>,
    <rect name="grl" x={860} y={730} width={200} height={7} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:200,height:20}}
      animate={[{property:"maskWidth", keyframes:[{at:1.5,value:0},{at:2.1,value:200,easing:"house"}]}]} />,
    <text name="tag" x={0} y={776} width={W} align="center" fontFamily={UI} fontSize={40} fontWeight={700} color={MUT}
      animate={up(1.75,0.45,20)}>We run your ads inside ChatGPT.</text>,
    <text name="dom" x={0} y={862} width={W} align="center" fontFamily={UI} fontSize={28} fontWeight={800} letterSpacing={4} color={BLUEI}
      animate={up(2.1,0.45,16)}>NEEDMOMENTUM.COM</text>,
  ], {at:21.0, dur:5.0, name:"E-lockup"});

  await p.render({out:"renders/f1.mp4", quality:"final"});
};
