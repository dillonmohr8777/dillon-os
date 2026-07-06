import {continueRender, delayRender} from 'remotion';
import {ANTON_B64} from './anton-font-data';

// The font is embedded as base64 and loaded from an ArrayBuffer: no network
// fetch, so render workers can't hang waiting on it. A safety timer clears
// the delayRender handle regardless (continueRender is idempotent).
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  // retries: if a render worker tab freezes hard (JS stops executing, so
  // even the safety timer can't fire), Remotion reopens the page and
  // retries the frame instead of cancelling the whole render.
  const handle = delayRender('Loading Anton font', {retries: 2});

  const done = () => continueRender(handle);
  const safety = setTimeout(done, 8000);

  try {
    const binary = atob(ANTON_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const anton = new FontFace('Anton', bytes.buffer);
    anton
      .load()
      .then((font) => {
        document.fonts.add(font);
        clearTimeout(safety);
        done();
      })
      .catch((err) => {
        console.error('Font failed to load', err);
        clearTimeout(safety);
        done();
      });
  } catch (err) {
    console.error('Font decode failed', err);
    clearTimeout(safety);
    done();
  }
}
