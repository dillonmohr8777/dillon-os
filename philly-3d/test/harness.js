// Loads the viewer's browser scripts into a node context so the same files can
// be unit tested and shipped. The viewer deliberately uses classic scripts and
// globals rather than modules, so it runs from a plain directory with no build
// step; this harness is what keeps that testable.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const JS_DIR = path.join(__dirname, '..', 'viewer', 'js');

function loadViewer(files) {
  const ctx = vm.createContext({
    console, TextDecoder, TextEncoder, Math, Date, performance,
    Float32Array, Float64Array, Int8Array, Int16Array, Int32Array,
    Uint8Array, Uint16Array, Uint32Array, ArrayBuffer, DataView,
    isNaN, isFinite, parseInt, parseFloat, JSON,
  });
  for (const f of files) {
    const src = fs.readFileSync(path.join(JS_DIR, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}

module.exports = { loadViewer, JS_DIR };
