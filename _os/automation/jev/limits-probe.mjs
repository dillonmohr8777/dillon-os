import { generateText, experimental_evaluate as evaluate } from 'ai';

// 1. Can it generate? This is the whole "can it run a workflow" question.
try {
  const r = await generateText({ model: 'typesafe-ai/jev', prompt: 'Write one sentence.' });
  console.log('GENERATE OK:', r.text);
} catch (e) {
  console.log('GENERATE FAILED:', e.name, '|', (e.message || '').split('\n')[0].slice(0, 200));
}

// 2. Can it choose its own next action, given tools? That is what an agent does.
try {
  const r = await generateText({
    model: 'typesafe-ai/jev',
    prompt: 'Read the file and report.',
    tools: { readFile: { description: 'read a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } } },
  });
  console.log('TOOLS OK:', JSON.stringify(r.toolCalls));
} catch (e) {
  console.log('TOOLS FAILED:', e.name, '|', (e.message || '').split('\n')[0].slice(0, 200));
}

// 3. Can it produce anything OTHER than a fixed set of options? Give it an
//    open-ended judgement with no criteria to pick from.
try {
  const r = await evaluate({
    model: 'typesafe-ai/jev',
    state: 'The client wants a landing page for a landscaping company.',
    questions: { plan: { type: 'choice', instructions: 'What should we build?', criteria: {} } },
  });
  console.log('OPEN-ENDED OK:', JSON.stringify(r.answers));
} catch (e) {
  console.log('OPEN-ENDED FAILED:', e.name, '|', (e.message || '').split('\n')[0].slice(0, 200));
}
