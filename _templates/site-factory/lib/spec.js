/**
 * Canonical batch spec measured across the existing Philly-25 sites.
 * Spec misses are gate failures for qa_ready, not soft warnings.
 */
const SPEC = {
  sections: [9, 11],
  words: [350, 500],
  images: [12, 13],
  kb: [27, 37],
};

function checkSpec(metrics) {
  const failures = [];
  const { sections, words, images } = metrics;
  const imageFloor = Number.isFinite(metrics.minImages) ? metrics.minImages : SPEC.images[0];
  const wordCeiling = Number.isFinite(metrics.maxWords) ? metrics.maxWords : SPEC.words[1];
  if (sections != null && (sections < SPEC.sections[0] || sections > SPEC.sections[1])) {
    failures.push(`spec sections ${sections} outside ${SPEC.sections[0]}-${SPEC.sections[1]}`);
  }
  if (words != null && (words < SPEC.words[0] || words > wordCeiling)) {
    failures.push(`spec words ${words} outside ${SPEC.words[0]}-${wordCeiling}`);
  }
  if (images != null && (images < imageFloor || images > SPEC.images[1])) {
    failures.push(`spec images ${images} outside ${imageFloor}-${SPEC.images[1]}`);
  }
  return failures;
}

module.exports = { SPEC, checkSpec };
