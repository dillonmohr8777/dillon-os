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
  if (sections != null && (sections < SPEC.sections[0] || sections > SPEC.sections[1])) {
    failures.push(`spec sections ${sections} outside ${SPEC.sections[0]}-${SPEC.sections[1]}`);
  }
  if (words != null && (words < SPEC.words[0] || words > SPEC.words[1])) {
    failures.push(`spec words ${words} outside ${SPEC.words[0]}-${SPEC.words[1]}`);
  }
  if (images != null && (images < SPEC.images[0] || images > SPEC.images[1])) {
    failures.push(`spec images ${images} outside ${SPEC.images[0]}-${SPEC.images[1]}`);
  }
  return failures;
}

module.exports = { SPEC, checkSpec };
