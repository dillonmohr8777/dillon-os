import {continueRender, delayRender, staticFile} from 'remotion';

const handle = delayRender('Loading Anton font');

const anton = new FontFace(
  'Anton',
  `url(${staticFile('fonts/Anton-Regular.ttf')}) format('truetype')`,
);

anton
  .load()
  .then((font) => {
    document.fonts.add(font);
    continueRender(handle);
  })
  .catch((err) => {
    // Render with fallback font rather than hanging forever.
    console.error('Font failed to load', err);
    continueRender(handle);
  });
