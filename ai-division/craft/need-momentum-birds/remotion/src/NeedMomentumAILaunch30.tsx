import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

// Brand tokens and fonts: Momentum brand system v3. The 15s film is preserved.
const BLUE = '#1766ab';
const NAVY = '#072d53';
const CREAM = '#FBF8F4';
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const mix = (f: number, a: number, b: number, x = 0, y = 1) => interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
const rough = 'polygon(0.2% 1%, 8% 0.5%, 16% 1%, 24% 0%, 35% .6%, 44% .2%, 56% .7%, 69% 0%, 82% .6%, 93% 0%, 99.8% .8%, 99.6% 20%, 100% 37%, 99.6% 59%, 100% 79%, 99.6% 99.4%, 86% 100%, 72% 99.4%, 54% 100%, 40% 99.3%, 25% 100%, 10% 99.4%, .4% 100%, 0% 78%, .4% 54%, 0% 28%)';

const Paper: React.FC<{children?: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <div style={{position: 'absolute', filter: 'drop-shadow(4px 13px 12px rgba(3,23,46,.22))', ...style}}><div style={{position: 'absolute', inset: 0, backgroundColor: CREAM, backgroundImage: `url(${staticFile('launch/paper.png')})`, backgroundSize: '170% 250%', backgroundPosition: 'center', clipPath: rough}}/><div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div></div>;
const Head: React.FC<{children: React.ReactNode; f: number; start: number; x?: number; y?: number; width?: number; size?: number}> = ({children, f, start, x = 145, y = 125, width = 1530, size = 94}) => <div style={{position: 'absolute', left: x, top: y, width, fontFamily: 'ArchivoNM', fontSize: size, lineHeight: 1.08, letterSpacing: '-.045em', color: CREAM, opacity: mix(f, start, start + 12), transform: `translateY(${mix(f, start, start + 20, 25, 0)}px)`}}>{children}</div>;
const Bird: React.FC<{kind?: 'dove' | 'cardinal'; x: number; y: number; size?: number; angle?: number; opacity?: number}> = ({kind = 'dove', x, y, size = 160, angle = 0, opacity = 1}) => <Img src={staticFile(`launch/${kind}.png`)} style={{position: 'absolute', left: x, top: y, width: size, height: size, objectFit: 'contain', opacity, transform: `rotate(${angle}deg)`, filter: 'drop-shadow(3px 7px 5px rgba(3,23,46,.24))'}}/>;
const Human: React.FC<{x: number; y: number; width: number; opacity?: number}> = ({x, y, width, opacity = 1}) => <Img src={staticFile('launch/human.png')} style={{position: 'absolute', left: x, top: y, width, opacity, filter: 'drop-shadow(8px 16px 10px rgba(3,23,46,.22))'}}/>;
const Check: React.FC<{progress: number; size?: number}> = ({progress, size = 55}) => <svg width={size} height={size} viewBox="0 0 64 64"><path d="M10 33 L26 48 L55 12" fill="none" stroke={BLUE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress}/></svg>;

// One continuous object carries the draft, human edit, and first workflow step.
const ReplyCard: React.FC<{f: number}> = ({f}) => {
  const reviewMove = mix(f, 258, 290);
  const routeMove = mix(f, 408, 448);
  const exit = mix(f, 582, 618);
  const x = 985 - reviewMove * 85 - routeMove * 730 + exit * 1980;
  const y = 438 - reviewMove * 70 + routeMove * 42 + exit * 330;
  const width = 760 + reviewMove * 60 - routeMove * 340;
  const height = 360 + reviewMove * 100 - routeMove * 120;
  const edited = f >= 332;
  return <Paper style={{left: x, top: y, width, height, transform: `translateY(${mix(f, 165, 186, 140, 0)}px) rotate(${2.5 - reviewMove * 5 + routeMove * 1.6}deg)`, opacity: mix(f, 165, 174)}}>
    <div style={{padding: `${width * .062}px`, color: NAVY}}>
      <div style={{fontSize: width * .038, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.1em', opacity: .7}}>{routeMove > .85 ? 'Reply reviewed' : edited ? 'Your reply' : 'AI draft'}</div>
      <div style={{fontSize: width * .062, fontWeight: 700, lineHeight: 1.24, marginTop: 24, minHeight: width * .18, opacity: mix(f, 185, 202)}}>{edited ? "Let's find a time that works." : 'What day works for you?'}</div>
      {f >= 305 && f < 332 && <div style={{height: 4, background: BLUE, width: `${mix(f, 305, 326, 0, 91)}%`, transform: 'rotate(-3deg)', marginTop: -53}}/>}
      {f >= 345 && <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: width * .014, fontSize: width * .04, opacity: mix(f, 345, 358)}}><Check progress={mix(f, 345, 361)} size={width * .065}/><span>Reviewed</span></div>}
    </div>
  </Paper>;
};

export const NeedMomentumAILaunch30: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('Load original Momentum brand fonts'));
  useEffect(() => {
    Promise.all([
      new FontFace('ArchivoNM', `url(${staticFile('fonts/ArchivoBlack-Regular.ttf')})`).load(),
      new FontFace('NunitoNM', `url(${staticFile('fonts/NunitoSans.ttf')})`).load(),
    ]).then((fonts) => {fonts.forEach((font) => document.fonts.add(font)); continueRender(handle);});
  }, [handle]);
  const s = f < 120 ? 0 : f < 270 ? 1 : f < 420 ? 2 : f < 600 ? 3 : f < 750 ? 4 : 5;
  return <AbsoluteFill style={{background: BLUE, fontFamily: 'NunitoNM', overflow: 'hidden'}}>
    <Audio src={staticFile('launch/paper-pulse.wav')}/>
    <Img src={staticFile('launch/paper.png')} style={{position: 'absolute', width: 2000, height: 1125, left: -40, top: -25, objectFit: 'cover', mixBlendMode: 'multiply'}}/>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(7,45,83,.07)'}}/>
    {s === 0 && <>
      <Head f={f} start={0} x={900} y={145} width={850} size={100}>The work<br/>keeps coming.</Head>
      <Human x={-360} y={370} width={1250}/>
      {['Reply', 'Plan', 'Follow up'].map((label, i) => <Paper key={label} style={{left: 995 + i * 75, top: 450 + i * 142, width: 470, height: 160, opacity: mix(f, 12 + i * 19, 20 + i * 19), transform: `translate(${mix(f, 12 + i * 19, 33 + i * 19, 180, 0)}px, ${mix(f, 12 + i * 19, 33 + i * 19, -90, 0)}px) rotate(${[-5, 3, -2][i]}deg)`}}><div style={{padding: '40px 50px', fontSize: 57, fontWeight: 750, color: NAVY}}>{label}</div></Paper>)}
      <Bird kind="cardinal" x={mix(f, 62, 96, -220, 785)} y={mix(f, 62, 96, 640, 445)} size={220} angle={mix(f, 62, 96, -18, -4)}/>
    </>}
    {s === 1 && <>
      <div style={{position: 'absolute', left: 150, top: 98, fontSize: 28, color: CREAM, letterSpacing: '.07em', opacity: mix(f, 130, 144)}}>Need Momentum · AI division</div>
      <Head f={f} start={132} y={161} size={91}>Start with a useful reply.</Head>
      <Paper style={{left: 150, top: 415, width: 685, height: 315, transform: 'rotate(-2deg)'}}><div style={{padding: 44, color: NAVY}}><div style={{fontSize: 28, letterSpacing: '.1em', fontWeight: 800, textTransform: 'uppercase', opacity: .7}}>Customer</div><div style={{fontSize: 49, fontWeight: 700, lineHeight: 1.28, marginTop: 24}}>Can we talk this week?</div></div></Paper>
      <Bird kind="cardinal" x={mix(f, 130, 175, 765, 830)} y={mix(f, 130, 175, 640, 690)} size={185} angle={-9}/>
      <Bird x={mix(f, 212, 244, -180, 1210)} y={mix(f, 212, 244, 850, 820)} size={190} angle={-5}/>
    </>}
    {s === 2 && <>
      <Head f={f} start={276} width={1300}>You make the call.</Head>
      <Human x={-360} y={400} width={1220}/>
      <Bird kind="cardinal" x={mix(f, 270, 290, 830, 805) + mix(f, 362, 408, 0, 100) - mix(f, 408, 448, 0, 675)} y={mix(f, 270, 290, 690, 850) - mix(f, 408, 448, 0, 26)} size={mix(f, 270, 290, 185, 170) - mix(f, 408, 448, 0, 25)} angle={mix(f, 408, 448, -5, -17)}/>
      <Bird x={mix(f, 270, 290, 1210, 1205) + mix(f, 369, 408, 0, 275) - mix(f, 408, 448, 0, 1000)} y={mix(f, 270, 290, 820, 790) + mix(f, 408, 448, 0, 74)} size={mix(f, 270, 290, 190, 180) - mix(f, 408, 448, 0, 45)} angle={mix(f, 408, 448, -12, 14)}/>
    </>}
    {f >= 400 && f < 630 && <svg width="1920" height="1080" style={{position: 'absolute', opacity: 1 - mix(f, 607, 630)}}><path d={`M ${mix(f, 408, 448, 965, 270)} ${mix(f, 408, 448, 682, 772)} C ${mix(f, 408, 448, 1120, 550)} ${mix(f, 600, 625, 875, 745)}, ${mix(f, 408, 448, 1320, 600)} ${mix(f, 600, 625, 812, 745)}, 825 ${mix(f, 600, 625, 775, 745)} S 1250 ${mix(f, 600, 625, 840, 745)}, 1635 ${mix(f, 600, 625, 750, 745)}`} fill="none" stroke={CREAM} strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - mix(f, 400, 498)}/></svg>}
    {s === 3 && <>
      <Head f={f} start={428} size={91}>Connect the next steps.</Head>
      {[{title: 'Meeting planned', start: 463, x: 715, angle: 2}, {title: 'Follow-up ready', start: 505, x: 1260, angle: -2}].map((card, i) => <Paper key={card.title} style={{left: card.x + mix(f, 582, 618, 0, 1980), top: 410 + mix(f, card.start, card.start + 24, 180, 0), width: 480, height: 340, opacity: mix(f, card.start, card.start + 9), transform: `rotate(${card.angle}deg)`}}><div style={{padding: 33, color: NAVY}}><div style={{fontSize: 29, fontWeight: 800}}>{card.title}</div>{i === 0 ? <svg width="170" height="170" viewBox="0 0 180 180" style={{marginTop: 25}}><rect x="10" y="25" width="145" height="125" rx="2" fill="none" stroke={BLUE} strokeWidth="5"/><path d="M10 61 H155 M44 10 V40 M120 10 V40" fill="none" stroke={BLUE} strokeWidth="5"/>{[0,1,2].map((n) => <path key={n} d={`M32 ${85 + n * 23} H132`} stroke={BLUE} opacity=".3" strokeWidth="4"/>)}</svg> : <div style={{marginTop: 45}}>{[100, 80, 91].map((n, k) => <div key={k} style={{height: 4, marginBottom: 25, width: `${n}%`, background: BLUE, opacity: .4}}/>)}<Check progress={mix(f, 535, 550)}/></div>}</div></Paper>)}
      {Array.from({length: 6}, (_, i) => <Bird key={i} kind={i === 0 ? 'cardinal' : 'dove'} x={(i < 2 ? mix(f, 408, 448, [905, 1480][i], [230, 480][i]) : mix(f, 424 + i * 18, 461 + i * 18, -180 - i * 70, [230, 480, 760, 995, 1270, 1530][i])) + mix(f, 576, 610, 0, 600)} y={i < 2 ? mix(f, 408, 448, [850, 790][i], [824, 864][i]) : [824, 864, 805, 855, 813, 853][i]} size={i < 2 ? mix(f, 408, 448, [170, 180][i], [145, 135][i]) : [145, 135, 174, 148, 161, 128][i]} angle={i < 2 ? mix(f, 408, 448, [-5, -12][i], [-17, 14][i]) : [-17, 14, -11, 2, -20, 8][i]}/>)}
    </>}
    {f >= 165 && f < 618 && <ReplyCard f={f}/>}
    {s === 4 && <>
      <Head f={f} start={610} x={1010} y={220} width={760} size={87}>Keep people<br/>at the center.</Head>
      <Human x={130} y={mix(f, 600, 633, 490, 385)} width={mix(f, 600, 728, 1120, 1070)} opacity={mix(f, 600, 620)}/>
      {Array.from({length: 10}, (_, i) => <Bird key={i} kind={i === 0 || i === 8 ? 'cardinal' : 'dove'} x={120 + i * 171 + mix(f, 600 + i * 4, 735, -400, 180)} y={100 + Math.sin(i * .67) * 58 - mix(f, 726, 750, 0, 300)} size={94 + (i % 3) * 18} angle={-12 + (i % 4) * 5} opacity={mix(f, 602 + i * 6, 624 + i * 6)}/>)}
    </>}
    {f >= 738 && <Paper style={{left: 85, top: mix(f, 738, 768, 1190, 72), width: 1750, height: 935}}>
      <div style={{opacity: mix(f, 755, 780), color: NAVY, textAlign: 'center'}}>
        <Img src={staticFile('launch/momentum-mark.png')} style={{position: 'absolute', left: 794, top: 84, width: 162, height: 162, objectFit: 'contain'}}/>
        <div style={{position: 'absolute', top: 301, width: '100%', fontFamily: 'ArchivoNM', fontSize: 105, letterSpacing: '-.055em'}}>Need Momentum</div>
        <div style={{position: 'absolute', top: 467, width: '100%', fontSize: 47, fontWeight: 650}}>Introducing our AI division</div>
        <div style={{position: 'absolute', top: 619, width: '100%', fontSize: 58, fontWeight: 800}}>Let's put AI to work.</div>
      </div>
      <Bird kind="cardinal" x={mix(f, 750, 780, -280, 135)} y={669} size={155} angle={-7}/>
      <Bird x={mix(f, 750, 780, 1890, 1450)} y={165} size={170} angle={6}/>
    </Paper>}
    {f >= 108 && f <= 132 && <Paper style={{left: mix(f, 108, 119, 995, -130), top: mix(f, 108, 119, 450, -140), width: mix(f, 108, 119, 470, 2210), height: mix(f, 108, 119, 160, 1410), transform: `translateX(${mix(f, 120, 132, 0, -2400)}px) rotate(${mix(f, 108, 119, -5, 0)}deg)`}}/>}
  </AbsoluteFill>;
};
