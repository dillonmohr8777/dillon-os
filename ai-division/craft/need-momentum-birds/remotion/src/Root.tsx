import "./index.css";
import {Composition} from "remotion";
import {NeedMomentumBirdsHero, FPS, DURATION, WIDTH, HEIGHT} from "./NeedMomentumBirdsHero";
import {NeedMomentumAILaunch30} from './NeedMomentumAILaunch30';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="NeedMomentumAILaunch30" component={NeedMomentumAILaunch30} durationInFrames={900} fps={30} width={1920} height={1080}/>
      <Composition
        id="NeedMomentumBirdsHero"
        component={NeedMomentumBirdsHero}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
