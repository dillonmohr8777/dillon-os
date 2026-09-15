const W=1920,H=1080;
const NIGHT="#0A1220", PANEL="#101B29", LINE="#1C3D5C", WIRE="#2A80C2", SKY="#7FC0EC",
      WHITE="#FFFFFF", GOLD="#FFC63B", MUT="#8AA0B6", INK="#0F1720", DIM="#6E86A0";
const DISP="Archivo Black", UI="Nunito Sans";
const R=Math.round;

const bg=(f)=><rect name="bg" x={0} y={0} width={W} height={H} fill={f} />;
const up=(t,d=0.42,y=24)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+d,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:y},{at:t+d+0.12,value:0,easing:"house"}]}];
const pop=(t)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+0.18,value:1}]},
  {property:"scale", keyframes:[{at:t,value:0.74},{at:t+0.28,value:1.05,easing:"house"},{at:t+0.42,value:1}]}];

// ---- the wireframe globe. longitudes are full circles whose scaleX rides a cosine,
// which is exactly what a rotating sphere's meridians do.
const ellipsePath=(rx,ry)=>{const kx=rx*0.5523,ky=ry*0.5523;return `M 0 ${ry} C 0 ${ry-ky} ${rx-kx} 0 ${rx} 0 C ${rx+kx} 0 ${2*rx} ${ry-ky} ${2*rx} ${ry} C ${2*rx} ${ry+ky} ${rx+kx} ${2*ry} ${rx} ${2*ry} C ${rx-kx} ${2*ry} 0 ${ry+ky} 0 ${ry} Z`;};
const circlePath=(r)=>ellipsePath(r,r);
const globe=(cx,cy,r,dur,t0)=>{
  const x=R(cx-r), y=R(cy-r), d=2*r, N=9, KF=19;
  const nodes=[];
  nodes.push(<path name="gout" x={x} y={y} width={d} height={d} d={circlePath(r)}
    fill={null} stroke={{color:LINE,width:2}}
    animate={[{property:"opacity", keyframes:[{at:t0,value:0},{at:t0+0.6,value:1}]},
              {property:"scale", keyframes:[{at:t0,value:0.8},{at:t0+0.9,value:1,easing:"house"}]}]} />);
  for(let i=0;i<N;i++){
    const kf=Array.from({length:KF},(_,k)=>{
      const t=k*dur/(KF-1);
      return {at:t, value:Math.cos(2*Math.PI*(t/dur)+i*Math.PI/N), easing:"linear"};
    });
    nodes.push(<path name={"lon"+i} x={x} y={y} width={d} height={d} d={circlePath(r)}
      fill={null} stroke={{color:i===0?WIRE:LINE,width:i===0?3:2}}
      animate={[{property:"scaleX", keyframes:kf},
                {property:"opacity", keyframes:[{at:t0+i*0.05,value:0},{at:t0+0.5+i*0.05,value:i===0?0.95:0.6}]}]} />);
  }
  for(let j=1;j<=4;j++){
    const ry=R(r*Math.sin(j*Math.PI/10)), rx=R(r*Math.cos(j*Math.PI/10)*0+r);
    const yy=R(r*Math.cos(j*Math.PI/10));
    [-1,1].forEach((sgn,q)=>{
      const rr=R(Math.sqrt(Math.max(1,r*r-yy*yy)));
      nodes.push(<path name={"lat"+j+q} x={R(cx-rr)} y={R(cy+sgn*yy-14)} width={2*rr} height={28}
        d={ellipsePath(rr,14)} fill={null} stroke={{color:LINE,width:2}}
        animate={[{property:"opacity", keyframes:[{at:t0+0.3+j*0.06,value:0},{at:t0+0.8+j*0.06,value:0.55}]}]} />);
    });
  }
  // dot field
  for(let k=0;k<64;k++){
    const a=(k*137.508)*Math.PI/180, rad=r*0.94*Math.sqrt(((k+0.5)/64));
    const px=R(cx+Math.cos(a)*rad), py=R(cy+Math.sin(a)*rad*0.98);
    const s=(k%7===0)?7:5;
    nodes.push(<rect name={"dot"+k} x={px} y={py} width={s} height={s} radius={R(s/2)}
      fill={(k%9===0)?GOLD:((k%3===0)?SKY:WIRE)}
      animate={[{property:"opacity", keyframes:[
        {at:t0+0.4+(k%12)*0.045,value:0},{at:t0+0.8+(k%12)*0.045,value:0.9},
        {at:t0+1.8+(k%12)*0.09,value:0.35},{at:t0+2.8+(k%12)*0.09,value:0.9}]}]} />);
  }
  // two orbit rings
  [[R(r*1.22),R(r*0.30),-18,10],[R(r*1.34),R(r*0.20),24,-14]].forEach(([rx,ry,a0,a1],m)=>{
    nodes.push(<path name={"orb"+m} x={R(cx-rx)} y={R(cy-ry)} width={2*rx} height={2*ry}
      d={ellipsePath(rx,ry)} fill={null} stroke={{color:m?GOLD:SKY,width:2}}
      animate={[{property:"opacity", keyframes:[{at:t0+0.9+m*0.2,value:0},{at:t0+1.5+m*0.2,value:m?0.85:0.6}]},
                {property:"rotation", keyframes:[{at:0,value:a0},{at:dur,value:a0+a1,easing:"linear"}]}]} />);
  });
  return nodes;
};

const slab=(t)=>[
  <rect name="slabr" x={1500} y={84} width={332} height={54} radius={6} fill={GOLD} animate={up(t,0.4,-14)} />,
  <text name="slabt" x={1500} y={96} width={332} align="center" fontFamily={DISP} fontSize={30} color={INK}
    animate={up(t+0.05,0.4,-14)}>MOMENTUM</text>,
  <text name="slabs" x={1500} y={150} width={332} align="center" fontFamily={UI} fontSize={20} fontWeight={800}
    letterSpacing={6} color={MUT} animate={up(t+0.15,0.4,-10)}>AI DIVISION</text>,
];

export default async ({project}) => {
  const p = await project({dir:"proj", size:"1920x1080", fps:30, background:NIGHT});
  const mark = await p.add("src/mm-white.png");
  const oai = await p.add("src/openai.png");
  const ppx = await p.add("src/perplexity.png");
  const gem = await p.add("src/gemini.png");
  const goo = await p.add("src/google.png");
  const cld = await p.add("src/claude.png");

  /* ---------- A. the globe arrives ---------- */
  p.compose([ bg(NIGHT),
    ...globe(1180, 540, 340, 5.2, 0.1),
    <media name="tm" file={mark} x={92} y={86} width={46} animate={up(0.5,0.4,-12)} />,
    <text name="tw" x={154} y={92} width={420} fontFamily={DISP} fontSize={30} color={WHITE}
      animate={up(0.55,0.4,-12)}>MOMENTUM</text>,
    ...slab(0.7),
    <text name="ac" x={92} y={952} width={900} fontFamily={UI} fontSize={26} fontWeight={800}
      letterSpacing={5} color={DIM} animate={up(1.6,0.5,16)}>THE ANSWER LAYER, WATCHED DAILY</text>,
  ], {at:0, dur:5.2, name:"A-globe"});

  /* ---------- B. everywhere they ask ---------- */
  p.compose([ bg(NIGHT),
    ...globe(1420, 560, 300, 5.6, 0.0),
    <media name="tm" file={mark} x={92} y={86} width={46} animate={up(0.1,0.4,-12)} />,
    <text name="tw" x={154} y={92} width={420} fontFamily={DISP} fontSize={30} color={WHITE}
      animate={up(0.12,0.4,-12)}>MOMENTUM</text>,
    ...slab(0.2),
    <text name="h1" x={92} y={370} width={1100} fontFamily={DISP} fontSize={150} color={WHITE}
      animate={up(0.5,0.5,30)}>EVERYWHERE</text>,
    <text name="h2" x={92} y={520} width={1100} fontFamily={DISP} fontSize={150} color={GOLD}
      animate={up(0.8,0.5,30)}>THEY ASK</text>,
    <rect name="hr" x={92} y={700} width={420} height={3} fill={LINE} animate={up(1.3,0.4,0)} />,
    <text name="h3" x={92} y={740} width={780} fontFamily={UI} fontSize={32} fontWeight={600} color={MUT}
      animate={up(1.5,0.5,18)}>ChatGPT. Perplexity. Gemini. Claude. Google AI Overviews. If a machine is answering for your market, that is the market.</text>,
  ], {at:5.2, dur:5.6, name:"B-headline"});

  /* ---------- C. the engines ---------- */
  const ENG=[["ChatGPT",oai],["Perplexity",ppx],["Gemini",gem],["Claude",cld],["Google AI",goo]];
  p.compose([ bg(NIGHT),
    ...globe(960, 520, 260, 5.2, 0.0),
    <media name="tm" file={mark} x={92} y={86} width={46} animate={up(0.1,0.4,-12)} />,
    <text name="tw" x={154} y={92} width={420} fontFamily={DISP} fontSize={30} color={WHITE}
      animate={up(0.12,0.4,-12)}>MOMENTUM</text>,
    ...slab(0.2),
    ...ENG.flatMap(([n,ic],i)=>{
      const a=(-90+i*72)*Math.PI/180;
      const cx=R(960+Math.cos(a)*430), cy=R(520+Math.sin(a)*330);
      return [
        <rect name={"ec"+i} x={R(cx-64)} y={R(cy-64)} width={128} height={128} radius={30} fill={PANEL}
          strokeWidth={2} strokeColor={LINE} animate={pop(1.1+i*0.22)} />,
        <media name={"ei"+i} file={ic} x={R(cx-28)} y={R(cy-34)} width={56} animate={pop(1.2+i*0.22)} />,
        <text name={"en"+i} x={R(cx-110)} y={R(cy+76)} width={220} align="center" fontFamily={UI} fontSize={24}
          fontWeight={800} color={MUT} animate={pop(1.25+i*0.22)}>{n}</text>,
      ];
    }),
    <text name="cc" x={0} y={946} width={W} align="center" fontFamily={UI} fontSize={34} fontWeight={700} color={WHITE}
      animate={up(2.6,0.5,18)}>Momentum tracks what every one of them says about you.</text>,
  ], {at:10.8, dur:5.2, name:"C-engines"});

  /* ---------- D. the coverage board ---------- */
  const BOARD=[["Cited in ChatGPT","live","#2E7D6B"],["Cited in Perplexity","live","#2E7D6B"],
               ["Gemini · brand entity","building","#B8862A"],["Google AI Overview","live","#2E7D6B"],
               ["Schema + entity graph","shipped","#2E7D6B"]];
  p.compose([ bg(NIGHT),
    <text name="dh" x={200} y={168} width={1520} fontFamily={DISP} fontSize={76} color={WHITE}
      animate={up(0.25,0.5,26)}>Answer coverage, not vanity rank.</text>,
    ...BOARD.flatMap(([n,s,c],i)=>[
      <rect name={"b"+i} x={200} y={R(320+i*116)} width={1520} height={96} radius={18} fill={PANEL}
        strokeWidth={2} strokeColor={LINE} animate={up(0.7+i*0.2,0.45,22)} />,
      <rect name={"bd"+i} x={240} y={R(320+i*116+38)} width={20} height={20} radius={10} fill={c}
        animate={up(0.75+i*0.2,0.4,0)} />,
      <text name={"bn"+i} x={296} y={R(320+i*116+30)} width={900} fontFamily={UI} fontSize={34} fontWeight={700}
        color={WHITE} animate={up(0.78+i*0.2,0.45,18)}>{n}</text>,
      <rect name={"bp"+i} x={1520} y={R(320+i*116+26)} width={160} height={44} radius={22} fill={c}
        animate={up(0.85+i*0.2,0.45,18)} />,
      <text name={"bs"+i} x={1520} y={R(320+i*116+37)} width={160} align="center" fontFamily={UI} fontSize={21}
        fontWeight={800} color={WHITE} animate={up(0.88+i*0.2,0.45,18)}>{s}</text>,
    ]),
    <text name="dc" x={200} y={946} width={1520} fontFamily={UI} fontSize={30} fontWeight={600} color={DIM}
      animate={up(2.1,0.5,18)}>Illustrative board. Your live coverage is checked weekly and reported by name.</text>,
  ], {at:16.0, dur:5.4, name:"D-board"});

  /* ---------- E. lockup ---------- */
  p.compose([ bg(NIGHT),
    <media name="lm" file={mark} x={806} y={252} width={300}
      animate={[{property:"opacity", keyframes:[{at:0.1,value:0},{at:0.45,value:1}]},
                {property:"rotation", keyframes:[{at:0.1,value:-200},{at:1.3,value:0,easing:"house"}]},
                {property:"scale", keyframes:[{at:0.1,value:0.35},{at:1.1,value:1.06,easing:"house"},{at:1.4,value:1}]}]} />,
    <text name="wmk" x={0} y={606} width={W} align="center" fontFamily={DISP} fontSize={112} color={WHITE}
      animate={up(1.05,0.45,26)}>Momentum</text>,
    <rect name="grl" x={860} y={748} width={200} height={7} radius={4} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-6,width:200,height:20}}
      animate={[{property:"maskWidth", keyframes:[{at:1.45,value:0},{at:2.05,value:200,easing:"house"}]}]} />,
    <text name="tag" x={0} y={794} width={W} align="center" fontFamily={UI} fontSize={38} fontWeight={700}
      letterSpacing={3} color={MUT} animate={up(1.75,0.45,20)}>AEO · SEO · GEO</text>,
    <text name="dom" x={0} y={888} width={W} align="center" fontFamily={UI} fontSize={28} fontWeight={800}
      letterSpacing={4} color={SKY} animate={up(2.15,0.45,16)}>NEEDMOMENTUM.COM</text>,
  ], {at:21.4, dur:4.8, name:"E-lockup"});

  await p.render("renders/f4.mp4", {quality:"final"});
};
