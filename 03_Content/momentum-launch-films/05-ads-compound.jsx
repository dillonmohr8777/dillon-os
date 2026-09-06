const W=1920,H=1080;
const PAPER="#EDF1F9", WHITE="#FFFFFF", INK="#0F1720", MUT="#78889A", FAINT="#B3BECB",
      BLUE="#2A80C2", BLUEI="#2673AF", SKY="#63B2E8", GOLD="#FFC63B", DEEP="#0E1622",
      RULE="#DCE3EC", CHIP="#E3EAF3", BLACK="#141A21", GREEN="#2E7D6B";
const DISP="Archivo Black", UI="Nunito Sans";
const R=Math.round;

const bg=(f)=><rect name="bg" x={0} y={0} width={W} height={H} fill={f} />;
const up=(t,d=0.42,y=24)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+d,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:y},{at:t+d+0.12,value:0,easing:"house"}]}];
const inout=(a,b,y=24)=>[
  {property:"opacity", keyframes:[{at:a,value:0},{at:a+0.4,value:1},{at:b,value:1},{at:b+0.4,value:0}]},
  {property:"offsetY", keyframes:[{at:a,value:y},{at:a+0.6,value:0,easing:"house"}]}];
const pop=(t)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+0.18,value:1}]},
  {property:"scale", keyframes:[{at:t,value:0.76},{at:t+0.3,value:1.04,easing:"house"},{at:t+0.44,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:18},{at:t+0.42,value:0,easing:"house"}]}];

// two-tone headline on one line: part A right-aligned into a box that ends where B starts.
const duo=(k,y,size,a,b,ca,cb,anim)=>{
  const wa=R(a.length*size*0.60), wb=R(b.length*size*0.60), gap=R(size*0.30);
  const start=R((W-(wa+gap+wb))/2);
  return [
    <text name={k+"a"} x={0} y={y} width={Math.max(60,start+wa)} align="right" fontFamily={DISP}
      fontSize={size} color={ca} animate={anim}>{a}</text>,
    <text name={k+"b"} x={R(start+wa+gap)} y={y} width={W} align="left" fontFamily={DISP}
      fontSize={size} color={cb} animate={anim}>{b}</text>,
  ];
};

// a little browser card with a mini layout inside
const card=(k,x,y,w,h,tint,anim)=>(
  <group name={k} x={x} y={y} width={w} height={h} animate={anim}>
    <rect name={k+"s"} x={0} y={0} width={w} height={h} radius={18} fill={WHITE}
      strokeWidth={2} strokeColor={RULE} shadow={{x:0,y:16,blur:40,color:"rgba(15,23,32,0.12)"}} />
    <rect name={k+"c"} x={2} y={2} width={R(w-4)} height={34} radius={16} fill={CHIP} />
    <rect name={k+"c2"} x={2} y={20} width={R(w-4)} height={16} fill={CHIP} />
    <rect name={k+"d1"} x={16} y={13} width={10} height={10} radius={5} fill="#C6D0DB" />
    <rect name={k+"d2"} x={32} y={13} width={10} height={10} radius={5} fill="#C6D0DB" />
    <rect name={k+"hero"} x={16} y={50} width={R(w-32)} height={R(h*0.40)} radius={12} fill={tint} />
    <rect name={k+"t1"} x={16} y={R(h*0.40)+68} width={R(w*0.62)} height={14} radius={7} fill="#DEE5ED" />
    <rect name={k+"t2"} x={16} y={R(h*0.40)+92} width={R(w*0.44)} height={14} radius={7} fill="#E6EBF2" />
    <rect name={k+"b1"} x={16} y={R(h*0.40)+124} width={110} height={30} radius={15} fill={BLUE} />
  </group>
);

export default async ({project}) => {
  const p = await project({dir:"proj", size:"1920x1080", fps:30, background:PAPER});
  const mm = await p.add("src/mm.png");

  /* ---------- A. the line ---------- */
  p.compose([ bg(PAPER),
    ...duo("l1", 452, 96, "Most ads just", "run.", INK, FAINT, inout(0.3,1.9,26)),
    ...duo("l2", 452, 96, "Great ads", "compound.", INK, BLUEI, inout(2.2,3.9,26)),
    <path name="arw" x={1470} y={250} width={220} height={300}
      d="M 10 290 L 90 190 L 140 240 L 210 60" fill={null} stroke={{color:GOLD,width:9}}
      mask={{shape:"rectangle",x:-10,y:-10,width:240,height:320}}
      animate={[{property:"maskWidth", keyframes:[{at:2.5,value:0},{at:3.6,value:240,easing:"house"}]},
                {property:"opacity", keyframes:[{at:2.4,value:0},{at:2.6,value:1},{at:4.1,value:1},{at:4.4,value:0}]}]} />,
    <rect name="ar2" x={1652} y={244} width={26} height={26} radius={13} fill={GOLD}
      animate={[{property:"opacity", keyframes:[{at:3.5,value:0},{at:3.75,value:1},{at:4.1,value:1},{at:4.4,value:0}]},
                {property:"scale", keyframes:[{at:3.5,value:0.3},{at:3.9,value:1,easing:"house"}]}]} />,
  ], {at:0, dur:4.6, name:"A-line"});

  /* ---------- B. the work, on a rail ---------- */
  const TINTS=[BLUE,BLUEI,GOLD,BLACK,SKY,GREEN];
  p.compose([ bg(PAPER),
    <text name="bh" x={0} y={168} width={W} align="center" fontFamily={DISP} fontSize={78} color={INK}
      animate={up(0.3,0.5,26)}>Built for your market.</text>,
    ...TINTS.map((t,i)=>card("cd"+i, R(-140+i*400), 340, 340, 420, t,
      [{property:"opacity", keyframes:[{at:0.5+i*0.09,value:0},{at:0.9+i*0.09,value:1}]},
       {property:"offsetX", keyframes:[{at:0.5,value:0},{at:5.4,value:-820,easing:"linear"}]},
       {property:"offsetY", keyframes:[{at:0.5+i*0.09,value:i%2?46:-46},{at:1.4+i*0.09,value:i%2?18:-18,easing:"house"}]},
       {property:"skewY", keyframes:[{at:0,value:i%2?-3:3},{at:5.4,value:i%2?-3:3}]}])),
    <text name="bc" x={0} y={880} width={W} align="center" fontFamily={UI} fontSize={34} fontWeight={700} color={MUT}
      animate={up(1.6,0.5,20)}>Sites, landing pages, ads and answers — one system, one team.</text>,
  ], {at:4.6, dur:5.4, name:"B-rail"});

  /* ---------- C. the service grid ---------- */
  const SVC=[["Google Ads","search + PMax",BLUE],["Meta Ads","prospecting + retargeting",BLUEI],
             ["Local SEO","maps, citations, GBP",GOLD],["AEO / GEO","named in the answer",BLACK],
             ["Landing pages","built to convert",SKY],["Reporting","real leads, by name",GREEN]];
  p.compose([ bg(PAPER),
    <text name="gh" x={0} y={150} width={W} align="center" fontFamily={DISP} fontSize={76} color={INK}
      animate={up(0.25,0.5,26)}>Six jobs. One invoice.</text>,
    ...SVC.flatMap(([n,s,c],i)=>{
      const x=R(180+(i%3)*530), y=R(320+Math.floor(i/3)*290);
      return [
        <rect name={"sc"+i} x={x} y={y} width={480} height={240} radius={24} fill={WHITE}
          strokeWidth={2} strokeColor={RULE} animate={pop(0.6+i*0.16)} />,
        <rect name={"si"+i} x={R(x+36)} y={R(y+36)} width={56} height={56} radius={16} fill={c}
          animate={pop(0.66+i*0.16)} />,
        <text name={"sn"+i} x={R(x+36)} y={R(y+118)} width={410} fontFamily={UI} fontSize={38}
          fontWeight={800} color={INK} animate={pop(0.7+i*0.16)}>{n}</text>,
        <text name={"ss"+i} x={R(x+36)} y={R(y+168)} width={410} fontFamily={UI} fontSize={25}
          fontWeight={600} color={MUT} animate={pop(0.74+i*0.16)}>{s}</text>,
      ];
    }),
  ], {at:10.0, dur:4.8, name:"C-grid"});

  /* ---------- D. not just clicks ---------- */
  const ROWS=[["Google Ads",0.86,BLUE],["Meta Ads",0.72,BLUEI],["Local SEO",0.64,GOLD],
              ["AEO / GEO",0.48,BLACK],["Named leads",0.91,GREEN]];
  p.compose([ bg(PAPER),
    ...duo("d1", 200, 82, "Not just clicks.", "Momentum.", FAINT, BLUEI, up(0.3,0.5,26)),
    ...ROWS.flatMap(([n,v,c],i)=>[
      <rect name={"rw"+i} x={300} y={R(370+i*104)} width={1320} height={80} radius={18} fill={WHITE}
        strokeWidth={2} strokeColor={RULE} animate={up(0.9+i*0.18,0.45,22)} />,
      <rect name={"ri"+i} x={332} y={R(370+i*104+22)} width={36} height={36} radius={10} fill={c}
        animate={up(0.94+i*0.18,0.4,18)} />,
      <text name={"rn"+i} x={392} y={R(370+i*104+22)} width={520} fontFamily={UI} fontSize={32}
        fontWeight={800} color={INK} animate={up(0.97+i*0.18,0.45,18)}>{n}</text>,
      <rect name={"rt"+i} x={950} y={R(370+i*104+34)} width={520} height={12} radius={6} fill={CHIP}
        animate={up(1.0+i*0.18,0.4,0)} />,
      <rect name={"rb"+i} x={950} y={R(370+i*104+34)} width={R(520*v)} height={12} radius={6} fill={c}
        mask={{shape:"rectangle",x:0,y:-8,width:R(520*v),height:28}}
        animate={[{property:"maskWidth", keyframes:[{at:1.3+i*0.18,value:0},{at:2.2+i*0.18,value:R(520*v),easing:"house"}]}]} />,
      <rect name={"rp"+i} x={1500} y={R(370+i*104+22)} width={92} height={36} radius={18} fill={CHIP}
        animate={up(1.1+i*0.18,0.4,14)} />,
      <text name={"rl"+i} x={1500} y={R(370+i*104+29)} width={92} align="center" fontFamily={UI}
        fontSize={19} fontWeight={800} color={MUT} animate={up(1.12+i*0.18,0.4,14)}>running</text>,
    ]),
    <text name="dc" x={0} y={946} width={W} align="center" fontFamily={UI} fontSize={30} fontWeight={600} color={MUT}
      animate={up(2.4,0.5,18)}>Illustrative view. Every number in a real report is matched to a named lead.</text>,
  ], {at:14.8, dur:5.2, name:"D-rows"});

  /* ---------- E. the bar ---------- */
  const STEPS=[["Ads",BLUE],["Answers",GOLD],["Attribution",BLUEI]];
  p.compose([ bg(PAPER),
    <rect name="gbar" x={300} y={460} width={1320} height={44} radius={22}
      fill={{kind:"linear", angle:90, stops:[{offset:0,color:SKY},{offset:0.5,color:BLUE},{offset:1,color:DEEP}]}}
      mask={{shape:"rectangle",x:0,y:-10,width:1320,height:64}}
      animate={[{property:"maskWidth", keyframes:[{at:0.4,value:0},{at:1.8,value:1320,easing:"house"}]}]} />,
    ...STEPS.flatMap(([n,c],i)=>{
      const x=R(300+i*440);
      return [
        <rect name={"sd"+i} x={R(x+206)} y={548} width={20} height={20} radius={10} fill={c}
          animate={up(1.5+i*0.24,0.4,0)} />,
        <text name={"st"+i} x={x} y={592} width={440} align="center" fontFamily={UI} fontSize={34}
          fontWeight={800} color={INK} animate={up(1.55+i*0.24,0.45,18)}>{n}</text>,
      ];
    }),
    <text name="eh" x={0} y={276} width={W} align="center" fontFamily={DISP} fontSize={80} color={INK}
      animate={up(0.25,0.5,26)}>One line, end to end.</text>,
    <text name="ec" x={0} y={720} width={W} align="center" fontFamily={UI} fontSize={32} fontWeight={600} color={MUT}
      animate={up(2.4,0.5,18)}>We buy the click, own the answer, and name the lead.</text>,
  ], {at:20.0, dur:4.4, name:"E-bar"});

  /* ---------- F. lockup ---------- */
  p.compose([ bg(PAPER),
    <group name="lock" x={806} y={228} width={308} height={308}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.45,value:1}]},
                {property:"rotation", keyframes:[{at:0.1,value:-200},{at:1.3,value:0,easing:"house"}]},
                {property:"scale", keyframes:[{at:0.1,value:0.35},{at:1.1,value:1.06,easing:"house"},{at:1.4,value:1}]}]}>
      <rect name="disc" x={0} y={0} width={308} height={308} radius={154} fill={WHITE} />
      <media name="lm" file={mm} x={0} y={0} width={308} />
    </group>,
    <text name="wmk" x={0} y={584} width={W} align="center" fontFamily={DISP} fontSize={116} color={INK}
      animate={up(1.05,0.45,26)}>Momentum</text>,
    <rect name="grl" x={860} y={730} width={200} height={7} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:200,height:20}}
      animate={[{property:"maskWidth", keyframes:[{at:1.45,value:0},{at:2.05,value:200,easing:"house"}]}]} />,
    <text name="tag" x={0} y={776} width={W} align="center" fontFamily={UI} fontSize={40} fontWeight={700} color={MUT}
      animate={up(1.75,0.45,20)}>Great ads compound.</text>,
    <text name="dom" x={0} y={866} width={W} align="center" fontFamily={UI} fontSize={28} fontWeight={800}
      letterSpacing={4} color={BLUEI} animate={up(2.15,0.45,16)}>NEEDMOMENTUM.COM</text>,
  ], {at:24.4, dur:4.6, name:"F-lockup"});

  await p.render("renders/f5.mp4", {quality:"final"});
};
