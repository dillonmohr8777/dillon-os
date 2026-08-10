# Editorial asset provenance

Generated: 2026-08-09

The hero plates, mobile crops, foreground layers, and six-frame editorial sequences are synthetic concept imagery. They do not depict completed client work, current inventory, real employees, diagnosed equipment, or verified service outcomes.

## Shared production method

- Tool: OpenAI image generation.
- Art direction: one coherent cinematic world per business, matched to its hero plate.
- Storyboard format: one 3-by-2 master image per business, cropped into six equal WebP frames.
- Interface text: never generated into imagery. All typography, labels, logos, and caveats are rendered in HTML/CSS using the self-hosted Lab Display, Lab Text, and approved Facet Display files.
- People: small synthetic environmental figures only; never represented as real employees.
- Release checks: exactly 18 editorial WebPs, six per prospect, with unique SHA-256 hashes recorded by `scripts/qa.mjs` in `artifacts/STATIC-QA.json`.

## MacLaren Kitchen & Bath

- Source storyboard: `exec-83ac1b38-18ae-49ea-945e-bf95c8c05d9c.png`
- World: unfinished blue-hour kitchen, dark walnut, veined stone, warm practical light.
- Sequence: shell, joinery macro, environmental craftsperson, stone, light, whole-room reveal.

## Golden Eagle Jewelry

- Source storyboard: `exec-33186c14-e641-40f1-ba1b-3f938dc18097.png`
- World: near-black jeweler's bench, rough golden mineral, tools, incomplete sculptural setting.
- Sequence: raw object, crystalline macro, environmental jeweler, tool detail, setting, resolved pairing.

## Morton Electric Pool & Spa

- Source storyboard: `exec-e1ce6b7e-dc61-4424-a001-35f435c944f1.png`
- World: blue-hour pool cutaway, cyan water, dark stone, copper lines, warm service light, steam.
- Sequence: surface, wet-stone macro, environmental technician, pump/copper detail, steam, complete system.

The original generated files remain in the local Codex generation store. User-facing master storyboards and higher-quality frame copies are preserved under `outputs/KAGE-OPUS-HANDOFF/site-assets/`.
