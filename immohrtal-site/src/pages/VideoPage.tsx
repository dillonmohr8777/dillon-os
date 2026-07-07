import { artist } from '../content/album'
import { SubPage } from '../components/SubPage'
import { TiltBox } from '../components/TiltBox'

export function VideoPage() {
  return (
    <SubPage tone="dark">
      <p className="section-eyebrow reveal" data-decode="">Official video</p>
      <h1 className="font-display chrome-text reveal mt-5 uppercase" style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.6rem)', lineHeight: 1 }}>
        Picking Up My Notepad
      </h1>
      <p className="font-serif italic reveal reveal-late mt-4" style={{ fontSize: 'clamp(1.2rem, 2.8vw, 1.7rem)', color: 'var(--ink)' }}>
        {artist.name} · 8 1 4 · Erie, PA
      </p>

      <div className="reveal reveal-late mt-12 w-full">
        <TiltBox max={3}>
          <figure className="pop-box m-0 block p-3">
            <video
              controls
              playsInline
              preload="metadata"
              poster="video/notepad-poster.jpg"
              className="block h-auto w-full rounded-xl"
            >
              <source src="video/picking-up-my-notepad.mp4" type="video/mp4" />
              Your browser doesn&apos;t support embedded video —
              <a href="video/picking-up-my-notepad.mp4">download it instead</a>.
            </video>
            <figcaption className="mono-tag mt-3 pb-1 text-center">
              Picking Up My Notepad // official video // 2:52
            </figcaption>
          </figure>
        </TiltBox>
      </div>

      <div className="mt-10 flex flex-col gap-6">
        <p className="reveal m-0 max-w-2xl text-[16.5px] leading-[1.8]" style={{ color: 'var(--dim)' }}>
          A living newsprint collage. Torn headlines from Erie to Pittsburgh, the
          lighthouse in the storm, the man in the moon, a white dog walking a park
          path toward the bridge — every cut riding the beat until the whole 814
          world breathes and warps like ink in water.
        </p>
        <p className="reveal reveal-late m-0 max-w-2xl text-[16.5px] leading-[1.8]" style={{ color: 'var(--dim)' }}>
          It ends where the music starts: family.
        </p>
      </div>

      <div className="reveal reveal-later mt-14 flex flex-col gap-4 sm:flex-row">
        <a className="btn btn-chrome" href="./index.html#listen">Hear the album</a>
        <a className="btn btn-ghost" href="./about.html">The story</a>
      </div>
    </SubPage>
  )
}
