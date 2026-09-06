const W=1920,H=1080;
const PAPER="#F5F6F4", WHITE="#FFFFFF", INK="#0F1720", MUT="#78889A", FAINT="#B4BEC9",
      BLUE="#2A80C2", BLUEI="#2673AF", SKY="#63B2E8", GOLD="#FFC63B", DEEP="#0E1622",
      RULE="#E4E8EC", CHIP="#ECEFF2", BLACK="#141A21", GREEN="#2E7D6B";
const DISP="Archivo Black", UI="Nunito Sans";
const R=Math.round;

const bg=(f)=><rect name="bg" x={0} y={0} width={W} height={H} fill={f} />;
const up=(t,d=0.42,y=24)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+d,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:y},{at:t+d+0.12,value:0,easing:"house"}]}];
const inout=(a,b,y=24)=>[
  {property:"opacity", keyframes:[{at:a,value:0},{at:a+0.4,value:1},{at:b,value:1},{at:b+0.4,value:0}]},
  {property:"offsetY", keyframes:[{at:a,value:y},{at:a+0.55,value:0,easing:"house"}]}];
const pop=(t)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+0.18,value:1}]},
  {property:"scale", keyframes:[{at:t,value:0.74},{at:t+0.28,value:1.04,easing:"house"},{at:t+0.42,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:16},{at:t+0.4,value:0,easing:"house"}]}];
const blink=(...ts)=>[{property:"scaleY", keyframes:ts.flatMap(t=>[
  {at:t,value:1},{at:t+0.07,value:0.08,easing:"house"},{at:t+0.16,value:1,easing:"house"}])}];

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
// the mark on its white disc, as one transformable unit
const lockmark=(cx,cy,size,anim)=>(
  <group name="lock" x={R(cx-size/2)} y={R(cy-size/2)} width={size} height={size} animate={anim}>
    <rect name="disc" x={0} y={0} width={size} height={size} radius={R(size/2)} fill={WHITE} />
    <media name="mk" file={MARK} x={0} y={0} width={size} />
  </group>
);
let MARK=null;

export default async ({project}) => {
  const p = await project({dir:"proj", size:"1920x1080", fps:30, background:PAPER});
  MARK = await p.add("src/mm.png");
  const oai = await p.add("src/openai.png");
  const ppx = await p.add("src/perplexity.png");
  const gem = await p.add("src/gemini.png");
  const goo = await p.add("src/google.png");

  /* ---------- A. the bars ---------- */
  const BARS=[[700,300],[860,420],[1020,240]];
  p.compose([ bg(PAPER),
    ...BARS.map(([x,h],i)=>(
      <rect name={"bar"+i} x={x} y={R(700-h)} width={140} height={h} radius={26}
        fill={{kind:"linear", angle:180, stops:[{offset:0,color:SKY},{offset:1,color:BLUE}]}}
        animate={[{property:"opacity", keyframes:[{at:0.15+i*0.14,value:0},{at:0.45+i*0.14,value:1},{at:3.2,value:1},{at:3.7,value:0}]},
                  {property:"scaleY", keyframes:[{at:0.15+i*0.14,value:0.06},{at:1.0+i*0.14,value:1,easing:"house"}]},
                  {property:"offsetY", keyframes:[{at:0.15+i*0.14,value:R(h*0.47)},{at:1.0+i*0.14,value:0,easing:"house"}]},
                  {property:"skewX", keyframes:[{at:2.4,value:0},{at:3.4,value:-14,easing:"house"}]}]} />
    )),
    ...BARS.map(([x,h],i)=>(
      <rect name={"cap"+i} x={R(x+34)} y={R(700-h-58)} width={72} height={72} radius={14} fill={BLACK}
        animate={[{property:"opacity", keyframes:[{at:1.0+i*0.14,value:0},{at:1.3+i*0.14,value:1},{at:3.2,value:1},{at:3.6,value:0}]},
                  {property:"offsetY", keyframes:[{at:1.0+i*0.14,value:24},{at:1.5+i*0.14,value:0,easing:"house"}]}]} />
    )),
    <text name="a1" x={0} y={806} width={W} align="center" fontFamily={UI} fontSize={38} fontWeight={700} color={MUT}
      animate={inout(1.9,3.3,18)}>Search used to be a list.</text>,
  ], {at:0, dur:4.0, name:"A-bars"});

  /* ---------- B. the line ---------- */
  p.compose([ bg(PAPER),
    <text name="b1" x={0} y={464} width={W} align="center" fontFamily={UI} fontSize={86} fontWeight={800} color={FAINT}
      animate={[{property:"opacity", keyframes:[{at:0.2,value:0},{at:0.7,value:1},{at:1.7,value:1},{at:2.05,value:0}]},
                {property:"blur", keyframes:[{at:1.7,value:0},{at:2.05,value:14}]}]}>People stopped searching.</text>,
    <text name="b2" x={0} y={396} width={W} align="center" fontFamily={DISP} fontSize={104} color={INK}
      animate={[{property:"opacity", keyframes:[{at:2.0,value:0},{at:2.45,value:1}]},
                {property:"blur", keyframes:[{at:2.0,value:16},{at:2.5,value:0}]},
                {property:"offsetY", keyframes:[{at:2.0,value:22},{at:2.6,value:0,easing:"house"}]}]}>They started</text>,
    <text name="b3" x={0} y={528} width={W} align="center" fontFamily={DISP} fontSize={104} color={BLUEI}
      animate={[{property:"opacity", keyframes:[{at:2.3,value:0},{at:2.75,value:1}]},
                {property:"blur", keyframes:[{at:2.3,value:16},{at:2.8,value:0}]},
                {property:"offsetY", keyframes:[{at:2.3,value:22},{at:2.9,value:0,easing:"house"}]}]}>asking.</text>,
  ], {at:4.0, dur:4.0, name:"B-line"});

  /* ---------- C. dots become Momo ---------- */
  const DOTS=[0,1,2,3,4,5,6,7].map(i=>{
    const a=i*Math.PI/4;
    return [R(Math.cos(a)*330), R(Math.sin(a)*330), i];
  });
  p.compose([ bg(PAPER),
    ...DOTS.map(([dx,dy,i])=>(
      <rect name={"dot"+i} x={946} y={492} width={28} height={28} radius={14} fill={i%3===0?GOLD:BLUE}
        animate={[{property:"opacity", keyframes:[{at:0.2+i*0.05,value:0},{at:0.5+i*0.05,value:1},{at:1.9,value:1},{at:2.2,value:0}]},
                  {property:"offsetX", keyframes:[{at:0.2+i*0.05,value:dx},{at:2.1,value:0,easing:"house"}]},
                  {property:"offsetY", keyframes:[{at:0.2+i*0.05,value:dy},{at:2.1,value:0,easing:"house"}]}]} />
    )),
    momo("m1", 960, 470, 1.35,
      [{property:"opacity", keyframes:[{at:2.05,value:0},{at:2.3,value:1}]},
       {property:"scale", keyframes:[{at:2.05,value:0.25},{at:2.55,value:1.08,easing:"house"},{at:2.8,value:1}]},
       {property:"offsetY", keyframes:[{at:2.9,value:0},{at:3.5,value:-14,easing:"house"},{at:4.1,value:0,easing:"house"}]}],
      blink(3.1)),
    <text name="c1" x={0} y={780} width={W} align="center" fontFamily={DISP} fontSize={72} color={INK}
      animate={up(2.9,0.45,24)}>So we taught Momo to answer.</text>,
    <text name="c2" x={0} y={880} width={W} align="center" fontFamily={UI} fontSize={34} fontWeight={600} color={MUT}
      animate={up(3.3,0.45,18)}>AEO, SEO and GEO, run as one job instead of three.</text>,
  ], {at:8.0, dur:4.8, name:"C-bloom"});

  /* ---------- D. the question and the answer ---------- */
  const Q="who's the best roofer in Philadelphia?";
  const ROWS=[["Northeast Roof Works","independent · 4.6★",false],
              ["Liberty Roof Co.","independent · 4.4★",false],
              ["Fishtown Exteriors","a Momentum client",true]];
  p.compose([ bg(PAPER),
    <rect name="bar" x={430} y={196} width={1060} height={124} radius={28} fill={WHITE}
      strokeWidth={2} strokeColor={RULE} shadow={{x:0,y:14,blur:44,color:"rgba(15,23,32,0.10)"}}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.5,value:1}]},
                {property:"offsetY", keyframes:[{at:0.1,value:30},{at:0.75,value:0,easing:"house"}]}]} />,
    <media name="oa" file={oai} x={478} y={238} width={40}
      animate={[{property:"opacity", keyframes:[{at:0.3,value:0},{at:0.7,value:1}]}]} />,
    <text name="qq" x={544} y={234} width={860} fontFamily={UI} fontSize={36} fontWeight={400} color={INK}
      animate={[{property:"textProgress", keyframes:[{at:0.8,value:0},{at:2.5,value:1,easing:"linear"}]},
                {property:"opacity", keyframes:[{at:0.75,value:0},{at:0.85,value:1}]}]}>{Q}</text>,
    <rect name="snd" x={1394} y={228} width={60} height={60} radius={30} fill={BLUE}
      animate={[{property:"opacity", keyframes:[{at:0.5,value:0},{at:0.8,value:1}]},
                {property:"scale", keyframes:[{at:2.6,value:1},{at:2.75,value:0.84,easing:"house"},{at:2.95,value:1}]}]} />,
    <path name="sar" x={1409} y={243} width={30} height={30} d="M 15 28 L 15 3 M 4 14 L 15 3 L 26 14"
      fill={null} stroke={{color:WHITE,width:4}}
      animate={[{property:"opacity", keyframes:[{at:0.55,value:0},{at:0.85,value:1}]}]} />,
    ...ROWS.flatMap(([n,s,hit],i)=>[
      <rect name={"r"+i} x={430} y={R(392+i*130)} width={1060} height={110} radius={20} fill={hit?"#E8F2FA":WHITE}
        strokeWidth={2} strokeColor={hit?BLUE:RULE} animate={pop(3.0+i*0.28)} />,
      <rect name={"rn"+i} x={472} y={R(422+i*130)} width={50} height={50} radius={25} fill={hit?BLUE:CHIP}
        animate={pop(3.05+i*0.28)} />,
      <text name={"rd"+i} x={472} y={R(432+i*130)} width={50} align="center" fontFamily={UI} fontSize={26}
        fontWeight={800} color={hit?WHITE:MUT} animate={pop(3.05+i*0.28)}>{String(i+1)}</text>,
      <text name={"rt"+i} x={548} y={R(418+i*130)} width={700} fontFamily={UI} fontSize={36} fontWeight={800} color={INK}
        animate={pop(3.1+i*0.28)}>{n}</text>,
      <text name={"rs"+i} x={548} y={R(462+i*130)} width={700} fontFamily={UI} fontSize={25} fontWeight={600}
        color={hit?BLUEI:MUT} animate={pop(3.1+i*0.28)}>{s}</text>,
    ]),
    <media name="hm" file={MARK} x={1372} y={R(392+2*130+30)} width={50}
      animate={[{property:"opacity", keyframes:[{at:4.1,value:0},{at:4.4,value:1}]},
                {property:"scale", keyframes:[{at:4.1,value:0.4},{at:4.55,value:1.1,easing:"house"},{at:4.8,value:1}]}]} />,
    <text name="dcap" x={0} y={860} width={W} align="center" fontFamily={UI} fontSize={38} fontWeight={700} color={INK}
      animate={up(4.4,0.45,20)}>Being listed is the new ranking.</text>,
  ], {at:12.8, dur:5.4, name:"D-answer"});

  /* ---------- E. coverage ---------- */
  const ENG=[["ChatGPT",oai],["Perplexity",ppx],["Gemini",gem],["Google AI",goo]];
  p.compose([ bg(PAPER),
    <text name="eh" x={0} y={228} width={W} align="center" fontFamily={DISP} fontSize={82} color={INK}
      animate={up(0.25,0.45,24)}>We cover the whole answer layer.</text>,
    ...ENG.flatMap(([n,ic],i)=>{
      const x=R(250+i*370);
      return [
        <rect name={"ec"+i} x={x} y={382} width={320} height={320} radius={30} fill={WHITE}
          strokeWidth={2} strokeColor={RULE} animate={pop(0.8+i*0.22)} />,
        <media name={"ei"+i} file={ic} x={R(x+130)} y={444} width={60} animate={pop(0.9+i*0.22)} />,
        <text name={"en"+i} x={x} y={548} width={320} align="center" fontFamily={UI} fontSize={30}
          fontWeight={800} color={INK} animate={pop(0.95+i*0.22)}>{n}</text>,
        <rect name={"ep"+i} x={R(x+96)} y={606} width={128} height={44} radius={22} fill={GREEN}
          animate={pop(1.9+i*0.18)} />,
        <text name={"et"+i} x={R(x+96)} y={617} width={128} align="center" fontFamily={UI} fontSize={21}
          fontWeight={800} color={WHITE} animate={pop(1.95+i*0.18)}>covered</text>,
      ];
    }),
    <text name="ec2" x={0} y={800} width={W} align="center" fontFamily={UI} fontSize={36} fontWeight={700} color={MUT}
      animate={up(2.7,0.45,20)}>One system for AEO, SEO and GEO. Run by Momentum.</text>,
  ], {at:18.2, dur:5.0, name:"E-coverage"});

  /* ---------- F. lockup ---------- */
  p.compose([ bg(PAPER),
    lockmark(960, 356, 296,
      [{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.45,value:1}]},
       {property:"rotation", keyframes:[{at:0.1,value:-200},{at:1.3,value:0,easing:"house"}]},
       {property:"scale", keyframes:[{at:0.1,value:0.35},{at:1.1,value:1.06,easing:"house"},{at:1.4,value:1}]}]),
    <text name="wmk" x={0} y={548} width={W} align="center" fontFamily={DISP} fontSize={112} color={INK}
      animate={up(1.05,0.45,26)}>Momentum</text>,
    <rect name="grl" x={860} y={688} width={200} height={7} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:200,height:20}}
      animate={[{property:"maskWidth", keyframes:[{at:1.45,value:0},{at:2.05,value:200,easing:"house"}]}]} />,
    <text name="tag" x={0} y={734} width={W} align="center" fontFamily={UI} fontSize={40} fontWeight={700} color={MUT}
      animate={up(1.75,0.45,20)}>Get named in the answer.</text>,
    <text name="dom" x={0} y={840} width={W} align="center" fontFamily={UI} fontSize={28} fontWeight={800}
      letterSpacing={4} color={BLUEI} animate={up(2.15,0.45,16)}>NEEDMOMENTUM.COM</text>,
  ], {at:23.2, dur:4.6, name:"F-lockup"});

  await p.render("renders/f3.mp4", {quality:"final"});
};
