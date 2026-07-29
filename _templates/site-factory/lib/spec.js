/**
 * Canonical batch spec measured across the existing Philly-25 sites.
 * Spec misses are gate failures for qa_ready, not soft warnings.
 */
const SPEC = {
  sections: [9, 11],
  words: [350, 500],
  images: [12, 13],
  kb: [27, 37],
  maxAssetKb: 2048,
  maxSingleAssetKb: 450,
};

function checkSpec(metrics) {
  const failures = [];
  const {
    sections,
    words,
    images,
    kb,
    assetBytes,
    largestAssetBytes,
    duplicateImageReferences,
  } = metrics;
  if (sections != null && (sections < SPEC.sections[0] || sections > SPEC.sections[1])) {
    failures.push(`spec sections ${sections} outside ${SPEC.sections[0]}-${SPEC.sections[1]}`);
  }
  if (words != null && (words < SPEC.words[0] || words > SPEC.words[1])) {
    failures.push(`spec words ${words} outside ${SPEC.words[0]}-${SPEC.words[1]}`);
  }
  if (images != null && (images < SPEC.images[0] || images > SPEC.images[1])) {
    failures.push(`spec images ${images} outside ${SPEC.images[0]}-${SPEC.images[1]}`);
  }
  if (kb != null && (kb < SPEC.kb[0] || kb > SPEC.kb[1])) {
    failures.push(`spec html ${kb} KB outside ${SPEC.kb[0]}-${SPEC.kb[1]} KB`);
  }
  if (assetBytes != null && assetBytes > SPEC.maxAssetKb * 1024) {
    failures.push(
      `asset payload ${(assetBytes / 1024).toFixed(1)} KB exceeds ${SPEC.maxAssetKb} KB`
    );
  }
  if (largestAssetBytes != null && largestAssetBytes > SPEC.maxSingleAssetKb * 1024) {
    failures.push(
      `largest asset ${(largestAssetBytes / 1024).toFixed(1)} KB exceeds ${SPEC.maxSingleAssetKb} KB`
    );
  }
  const duplicateCount = Array.isArray(duplicateImageReferences)
    ? duplicateImageReferences.length
    : Number(duplicateImageReferences || 0);
  if (duplicateCount > 0) {
    failures.push(`duplicate image references within site: ${duplicateCount}`);
  }
  return failures;
}

module.exports = { SPEC, checkSpec };
