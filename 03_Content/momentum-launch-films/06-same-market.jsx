const W=1920,H=1080;
const NIGHT="#0B0E12", PLATE="#151A21", EDGE="#242C36", WHITE="#FFFFFF", GREY="#57616D",
      DIM="#8592A0", BLUE="#2A80C2", SKY="#7FC0EC", GOLD="#FFC63B", MUT="#93A2B2", INK="#0F1720";
const DISP="Archivo Black", UI="Nunito Sans";
const R=Math.round;

const bg=(f)=><rect name="bg" x={0} y={0} width={W} height={H} fill={f} />;
const up=(t,d=0.45,y=24)=>[
  {property:"opacity", keyframes:[{at:t,value:0},{at:t+d,value:1}]},
  {property:"offsetY", keyframes:[{at:t,value:y},{at:t+d+0.14,value:0,easing:"house"}]}];
const life=(a,b)=>[{property:"opacity", keyframes:[{at:a,value:0},{at:a+0.5,value:1},{at:b,value:1},{at:b+0.5,value:0}]}];
const CX=[600,1320], CY=500, RAD=292;

// an aperture: the dark plate disc plus its ring
const disc=(k,cx,t)=>[
  <rect name={k+"r"} x={R(cx-RAD-3)} y={R(CY-RAD-3)} width={2*RAD+6} height={2*RAD+6} radius={RAD+3} fill={EDGE}
    animate={[{property:"opacity", keyframes:[{at:t,value:0},{at:t+0.5,value:1}]},
              {property:"scale", keyframes:[{at:t,value:0.86},{at:t+0.9,value:1,easing:"house"}]}]} />,
  <rect name={k+"p"} x={R(cx-RAD)} y={R(CY-RAD)} width={2*RAD} height={2*RAD} radius={RAD} fill={PLATE}
    animate={[{property:"opacity", keyframes:[{at:t,value:0},{at:t+0.5,value:1}]},
              {property:"scale", keyframes:[{at:t,value:0.86},{at:t+0.9,value:1,easing:"house"}]}]} />,
];
const label=(k,cx,txt,color,t)=>(
  <text name={k} x={R(cx-300)} y={R(CY+RAD+56)} width={600} align="center" fontFamily={UI}
    fontSize={26} fontWeight={800} letterSpacing={8} color={color} animate={up(t,0.45,16)}>{txt}</text>
);

export default async ({project}) => {
  const p = await project({dir:"proj", size:"1920x1080", fps:30, background:NIGHT});
  const mark = await p.add("src/mm-white.png");

  /* ---------- A. two apertures ---------- */
  const SCAT=[[-180,-120],[-90,40],[-20,-160],[30,90],[110,-40],[170,120],[-140,140],[60,-100],
              [-60,-30],[140,-140],[0,10],[-200,20],[200,-20],[80,180],[-110,-190]];
  p.compose([ bg(NIGHT),
    ...disc("l",CX[0],0.1), ...disc("r",CX[1],0.35),
    ...SCAT.map(([dx,dy],i)=>(
      <rect name={"sc"+i} x={R(CX[0]+dx)} y={R(CY+dy)} width={12} height={12} radius={6} fill={GREY}
        animate={[{property:"opacity", keyframes:[{at:1.0+i*0.045,value:0},{at:1.35+i*0.045,value:0.85}]},
                  {property:"scale", keyframes:[{at:1.0+i*0.045,value:0.2},{at:1.5+i*0.045,value:1,easing:"house"}]}]} />
    )),
    <path name="jag" x={R(CX[0]-210)} y={R(CY-90)} width={420} height={200}
      d="M 0 30 L 60 90 L 120 50 L 180 130 L 240 100 L 300 165 L 360 140 L 420 190"
      fill={null} stroke={{color:GREY,width:7}}
      mask={{shape:"rectangle",x:-10,y:-20,width:440,height:240}}
      animate={[{property:"maskWidth", keyframes:[{at:1.5,value:0},{at:3.0,value:440,easing:"house"}]}]} />,
    <path name="ris" x={R(CX[1]-210)} y={R(CY-120)} width={420} height={240}
      d="M 0 220 L 70 190 L 140 200 L 210 130 L 280 110 L 350 60 L 420 10"
      fill={null} stroke={{color:BLUE,width:9}}
      mask={{shape:"rectangle",x:-10,y:-20,width:440,height:280}}
      animate={[{property:"maskWidth", keyframes:[{at:1.7,value:0},{at:3.2,value:440,easing:"house"}]}]} />,
    ...[[0,220],[140,200],[280,110],[420,10]].map(([dx,dy],i)=>(
      <rect name={"gd"+i} x={R(CX[1]-210+dx-9)} y={R(CY-120+dy-9)} width={18} height={18} radius={9} fill={GOLD}
        animate={[{property:"opacity", keyframes:[{at:2.2+i*0.22,value:0},{at:2.5+i*0.22,value:1}]},
                  {property:"scale", keyframes:[{at:2.2+i*0.22,value:0.2},{at:2.7+i*0.22,value:1,easing:"house"}]}]} />
    )),
    label("lb",CX[0],"BEFORE",GREY,1.2),
    label("rb",CX[1],"AFTER",SKY,1.45),
  ], {at:0, dur:4.6, name:"A-plates"});

  /* ---------- B. the same market, seen twice ---------- */
  p.compose([ bg(NIGHT),
    ...disc("l",CX[0],0.0), ...disc("r",CX[1],0.0),
    ...[0,1,2,3,4,5,6].map(i=>(
      <rect name={"sr"+i} x={R(CX[0]-190)} y={R(CY-200+i*58)} width={R(i%3===0?380:300)} height={22} radius={11}
        fill={GREY} animate={[{property:"opacity", keyframes:[{at:0.5+i*0.09,value:0},{at:0.9+i*0.09,value:i===4?0.85:0.35}]}]} />
    )),
    <text name="a1" x={R(CX[1]-200)} y={R(CY-180)} width={400} fontFamily={UI} fontSize={27} fontWeight={600}
      color={WHITE} lineHeight={1.5} animate={up(0.7,0.5,18)}>{"For roofing in Philadelphia, the most\nconsistently recommended firm is"}</text>,
    <text name="a2" x={R(CX[1]-200)} y={R(CY-60)} width={400} fontFamily={UI} fontSize={34} fontWeight={800}
      color={SKY} animate={up(1.3,0.5,18)}>Fishtown Exteriors.</text>,
    <rect name="src" x={R(CX[1]-200)} y={R(CY+30)} width={340} height={62} radius={16} fill="#1D242D"
      animate={up(1.9,0.45,16)} />,
    <media name="sm" file={mark} x={R(CX[1]-184)} y={R(CY+44)} width={34} animate={up(1.95,0.45,16)} />,
    <text name="st" x={R(CX[1]-136)} y={R(CY+46)} width={260} fontFamily={UI} fontSize={22} fontWeight={800}
      color={DIM} animate={up(1.95,0.45,16)}>cited by Momentum</text>,
    label("lb",CX[0],"A LIST",GREY,0.5),
    label("rb",CX[1],"AN ANSWER",SKY,0.75),
  ], {at:4.6, dur:4.4, name:"B-answer"});

  /* ---------- C. the line ---------- */
  p.compose([ bg(NIGHT),
    <text name="c1" x={0} y={412} width={W} align="center" fontFamily={DISP} fontSize={110} color={GREY}
      animate={[{property:"opacity", keyframes:[{at:0.3,value:0},{at:0.9,value:1},{at:3.4,value:1},{at:3.8,value:0}]},
                {property:"offsetY", keyframes:[{at:0.3,value:24},{at:1.1,value:0,easing:"house"}]}]}>Same market.</text>,
    <text name="c2" x={0} y={550} width={W} align="center" fontFamily={DISP} fontSize={110} color={WHITE}
      animate={[{property:"opacity", keyframes:[{at:1.4,value:0},{at:2.0,value:1},{at:3.4,value:1},{at:3.8,value:0}]},
                {property:"offsetY", keyframes:[{at:1.4,value:24},{at:2.2,value:0,easing:"house"}]},
                {property:"blur", keyframes:[{at:1.4,value:14},{at:2.1,value:0}]}]}>Different answer.</text>,
    <rect name="cr" x={860} y={700} width={200} height={6} radius={3} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-8,width:200,height:22}}
      animate={[{property:"maskWidth", keyframes:[{at:2.3,value:0},{at:2.9,value:200,easing:"house"}]},
                {property:"opacity", keyframes:[{at:2.2,value:0},{at:2.4,value:1},{at:3.4,value:1},{at:3.8,value:0}]}]} />,
  ], {at:9.0, dur:4.2, name:"C-line"});

  /* ---------- D. the four plates ---------- */
  const P4=[["THE CLICK",BLUE],["THE RANK",DIM],["THE ANSWER",GOLD],["THE LEAD",SKY]];
  p.compose([ bg(NIGHT),
    <text name="dh" x={0} y={182} width={W} align="center" fontFamily={DISP} fontSize={74} color={WHITE}
      animate={up(0.25,0.5,26)}>We own all four.</text>,
    ...P4.flatMap(([n,c],i)=>{
      const cx=R(324+i*424), cy=560, r=142;
      return [
        <rect name={"pr"+i} x={R(cx-r-3)} y={R(cy-r-3)} width={2*r+6} height={2*r+6} radius={r+3} fill={EDGE}
          animate={[{property:"opacity", keyframes:[{at:0.7+i*0.2,value:0},{at:1.1+i*0.2,value:1}]},
                    {property:"scale", keyframes:[{at:0.7+i*0.2,value:0.7},{at:1.3+i*0.2,value:1,easing:"house"}]}]} />,
        <rect name={"p"+i} x={R(cx-r)} y={R(cy-r)} width={2*r} height={2*r} radius={r} fill={PLATE}
          animate={[{property:"opacity", keyframes:[{at:0.7+i*0.2,value:0},{at:1.1+i*0.2,value:1}]},
                    {property:"scale", keyframes:[{at:0.7+i*0.2,value:0.7},{at:1.3+i*0.2,value:1,easing:"house"}]}]} />,
        <rect name={"pd"+i} x={R(cx-34)} y={R(cy-34)} width={68} height={68} radius={i===2?34:14} fill={c}
          animate={[{property:"opacity", keyframes:[{at:1.15+i*0.2,value:0},{at:1.5+i*0.2,value:1}]},
                    {property:"rotation", keyframes:[{at:1.15+i*0.2,value:-60},{at:1.9+i*0.2,value:0,easing:"house"}]}]} />,
        <text name={"pt"+i} x={R(cx-200)} y={R(cy+r+44)} width={400} align="center" fontFamily={UI}
          fontSize={24} fontWeight={800} letterSpacing={6} color={c} animate={up(1.4+i*0.2,0.45,16)}>{n}</text>,
      ];
    }),
    <text name="dc" x={0} y={936} width={W} align="center" fontFamily={UI} fontSize={32} fontWeight={600} color={MUT}
      animate={up(2.5,0.5,18)}>Most agencies buy one of these. Momentum runs the whole chain.</text>,
  ], {at:13.2, dur:4.6, name:"D-four"});

  /* ---------- E. the finale ---------- */
  p.compose([
    <rect name="sky" x={0} y={0} width={W} height={H}
      fill={{kind:"linear", angle:160, stops:[{offset:0,color:"#0B0E12"},{offset:0.45,color:"#12314C"},{offset:1,color:"#2A80C2"}]}}
      animate={[{property:"opacity", keyframes:[{at:0,value:0},{at:1.4,value:1,easing:"house"}]}]} />,
    <media name="lm" file={mark} x={840} y={222} width={240}
      animate={[{property:"opacity", keyframes:[{at:1.2,value:0},{at:1.9,value:1}]},
                {property:"rotation", keyframes:[{at:1.2,value:-200},{at:2.5,value:0,easing:"house"}]},
                {property:"scale", keyframes:[{at:1.2,value:0.4},{at:2.3,value:1.06,easing:"house"},{at:2.6,value:1}]}]} />,
    <text name="wm" x={0} y={540} width={W} align="center" fontFamily={DISP} fontSize={120} color={WHITE}
      animate={[{property:"opacity", keyframes:[{at:2.2,value:0},{at:3.0,value:1}]},
                {property:"blur", keyframes:[{at:2.2,value:18},{at:3.1,value:0}]},
                {property:"scale", keyframes:[{at:2.2,value:0.96},{at:3.4,value:1,easing:"house"}]}]}>Momentum</text>,
    <rect name="gr" x={860} y={702} width={200} height={6} radius={3} fill={GOLD}
      mask={{shape:"rectangle",x:0,y:-8,width:200,height:22}}
      animate={[{property:"maskWidth", keyframes:[{at:3.2,value:0},{at:3.9,value:200,easing:"house"}]}]} />,
    <text name="tg" x={0} y={748} width={W} align="center" fontFamily={UI} fontSize={38} fontWeight={700} color="#CBDDEB"
      animate={up(3.5,0.5,20)}>Same budget. Different answer.</text>,
    <text name="dm" x={0} y={856} width={W} align="center" fontFamily={UI} fontSize={28} fontWeight={800}
      letterSpacing={4} color={WHITE} animate={up(3.9,0.5,16)}>NEEDMOMENTUM.COM</text>,
  ], {at:17.8, dur:5.4, name:"E-sky"});

  await p.render("renders/f6.mp4", {quality:"final"});
};
