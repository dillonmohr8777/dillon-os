import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const designPath = path.join(projectRoot, 'DESIGN.md')
const sidecarPath = path.join(projectRoot, '.impeccable', 'design.json')
const [design, rawSidecar, designStat] = await Promise.all([
  readFile(designPath, 'utf8'),
  readFile(sidecarPath, 'utf8'),
  stat(designPath),
])
const sidecar = JSON.parse(rawSidecar)

const section = (heading, nextHeading) => {
  const start = design.indexOf(`## ${heading}`)
  if (start < 0) return ''
  const contentStart = start + heading.length + 3
  const end = nextHeading ? design.indexOf(`## ${nextHeading}`, contentStart) : design.length
  return design.slice(contentStart, end < 0 ? design.length : end).trim()
}

const overviewSection = section('Overview', 'Colors')
const northStar = overviewSection.match(/\*\*Creative North Star: [“"]([^”"]+)[”"]\*\*/)?.[1] || 'Particle Proof Conveyor'
const overviewParts = overviewSection.split('**Key Characteristics:**')
const overview = overviewParts[0]
  .replace(/\*\*Creative North Star:[^\n]+\*\*/u, '')
  .replaceAll('**', '')
  .trim()
const keyCharacteristics = (overviewParts[1] || '')
  .split(/\r?\n/u)
  .map((line) => line.match(/^- (.+)$/u)?.[1])
  .filter(Boolean)

const headingPositions = [...design.matchAll(/^## (.+)$/gmu)].map((match) => ({
  heading: match[1],
  index: match.index,
}))
const ruleSection = (index) => {
  const owner = headingPositions.filter((heading) => heading.index < index).at(-1)?.heading || 'Overview'
  const names = {
    Colors: 'colors',
    Typography: 'typography',
    Layout: 'layout',
    'Elevation & Depth': 'elevation',
    Shapes: 'shapes',
    Components: 'components',
  }
  return names[owner] || 'overview'
}
const rules = [...design.matchAll(/\*\*The ([^*\n]+?) Rule\.\*\*\s+([^\r\n]+)/gu)].map((match) => ({
  name: `The ${match[1]} Rule`,
  body: match[2].trim(),
  section: ruleSection(match.index),
}))

const dosSection = section("Do's and Don'ts")
const [doBlock = '', dontBlock = ''] = dosSection.split("### Don't:")
const parseGuardrails = (block, label) => block
  .split(/\r?\n/u)
  .map((line) => line.match(new RegExp(`^- \\*\\*${label}\\*\\*\\s+(.+)$`, 'u'))?.[1])
  .filter(Boolean)
  .map((line) => `${label} ${line}`)

sidecar.schemaVersion = 2
sidecar.generatedAt = designStat.mtime.toISOString()
sidecar.title = 'Design System: IMMOHRTAL Marketing Solutions'
sidecar.narrative = {
  northStar,
  overview,
  keyCharacteristics,
  rules,
  dos: parseGuardrails(doBlock, 'Do'),
  donts: parseGuardrails(dontBlock, "Don't"),
}

if (sidecar.extensions?.typographyMeta?.body) {
  sidecar.extensions.typographyMeta.body.purpose = 'Customer outcomes first, with technical proof introduced only after the benefit is clear.'
}

const componentByName = new Map(sidecar.components.map((component) => [component.name, component]))
const primaryAction = componentByName.get('Primary Signal Action')
if (primaryAction) {
  primaryAction.description = 'The compact cyan action that invites a plain-language website conversation.'
  primaryAction.html = primaryAction.html.replace('OPEN CHANNEL', 'LET’S TALK')
}

const navigation = componentByName.get('Navigation Rail')
if (navigation) {
  navigation.description = 'The fixed branded rail that names customer outcomes and keeps direct contact available.'
  navigation.html = '<nav class="ds-nav-rail" aria-label="Primary navigation"><strong>IMMOHRTAL</strong><span>BETTER SITE</span><span>GET FOUND</span><span>AI WORKERS</span><a href="#">LET’S TALK</a></nav>'
}

const chip = componentByName.get('Project Discipline Chip')
if (chip) chip.html = '<span class="ds-chip">GET FOUND</span>'

const windowComponent = componentByName.get('Operating Evidence Window')
if (windowComponent) {
  windowComponent.description = 'A moving work artifact labeled with the customer-readable job, current step, and integrity receipt.'
  windowComponent.html = '<article class="ds-evidence-window"><header><span>WEBSITE CHECK</span><em>live page review</em></header><div class="ds-evidence-window__body">FIND → CHECK → FIX</div><small>Illustrative interface. Values populate only from a real audit.</small></article>'
}

const agentStation = {
  name: 'Agent Personality Station',
  kind: 'custom',
  description: 'A distinct robot silhouette paired with a plain-language job, personality, responsibility, and evidence receipt.',
  html: '<article class="ds-agent"><div class="ds-agent__bot" aria-hidden="true"><svg viewBox="0 0 90 110"><path d="M28 30 18 13M62 30l10-17M18 12l8 5M72 12l-8 5M22 31h46v28H22zM28 59h34v38H28zM28 66 13 83M62 66l15 17M35 97v10M55 97v10"/><path class="ds-agent__signal" d="M28 40h34M37 74h16"/></svg></div><div><small>FIND</small><h3>Scout</h3><strong>WEBSITE DETECTIVE</strong><p>Restlessly curious. Finds what is confusing, slow, hidden, or costing the website its next conversation.</p></div></article>',
  css: '.ds-agent { min-height: 260px; display: grid; grid-template-columns: minmax(180px,.8fr) minmax(260px,1.2fr); gap: 42px; align-items: center; padding: 30px; border-top: 1px solid rgba(166,204,240,.22); background: #07101f; color: #dce4ed; } .ds-agent__bot { display: grid; place-items: center; color: #18c8ff; } .ds-agent__bot svg { width: 150px; fill: none; stroke: currentColor; stroke-width: 3; } .ds-agent__bot .ds-agent__signal { stroke: #58edb2; } .ds-agent small { color: #18c8ff; font: 600 .67rem/1.3 "IBM Plex Mono", monospace; letter-spacing: .12em; } .ds-agent h3 { margin: 8px 0; color: #f3f7fb; font: 720 2.2rem/1.05 "Unbounded Variable", sans-serif; } .ds-agent strong { color: #58edb2; font: 700 .75rem/1.4 "Manrope Variable", sans-serif; } .ds-agent p { max-width: 54ch; color: #a7bbd1; font: 400 1rem/1.65 "Manrope Variable", sans-serif; } @media (max-width:640px) { .ds-agent { grid-template-columns: 1fr; gap: 18px; } }',
}
const agentIndex = sidecar.components.findIndex((component) => component.name === agentStation.name)
if (agentIndex >= 0) sidecar.components[agentIndex] = agentStation
else sidecar.components.push(agentStation)

await writeFile(sidecarPath, `${JSON.stringify(sidecar, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({
  output: path.relative(projectRoot, sidecarPath),
  generatedAt: sidecar.generatedAt,
  rules: rules.length,
  components: sidecar.components.length,
}, null, 2))
