import { experimental_evaluate as evaluate } from 'ai';

// Does the Gateway pass through TypeSafe's calibrated `confidence`?
// Open question from practitioners; the native API documents confidence on
// Choice and Score answers. Testing all three types in one request.
const r = await evaluate({
  model: 'typesafe-ai/jev',
  state: 'Open the pricing page and click the annual billing toggle.',
  questions: {
    element: {
      type: 'choice',
      instructions: 'Which element should be clicked?',
      criteria: {
        annual_toggle: 'a control switching billing to annual',
        monthly_toggle: 'a control switching billing to monthly',
        signup_button: 'a button that starts signup',
      },
    },
    confident: { type: 'boolean', instructions: 'Is the target unambiguous?' },
    risk: { type: 'score', instructions: 'How destructive is this click?', criteria: ['harmless', 'changes state', 'irreversible'] },
  },
});

console.log('answers          ', JSON.stringify(r.answers, null, 2));
console.log('providerMetadata ', JSON.stringify(r.providerMetadata, null, 2));
console.log('rounding         ', JSON.stringify(r.rounding));
console.log('response.modelId ', r.response?.modelId);
console.log('usage            ', JSON.stringify(r.usage));
