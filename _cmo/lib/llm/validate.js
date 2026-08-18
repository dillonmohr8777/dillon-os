/**
 * Minimal JSON Schema validator.
 *
 * Only the subset used by agent schemas: type, enum, required, properties,
 * items, min/max, minItems/maxItems, minLength/maxLength, pattern,
 * additionalProperties. Deliberately not a full JSON Schema implementation -
 * a dependency-free checker that covers what we generate is worth more than
 * a general one we do not control.
 *
 * The point is not to distrust the model. Strict tool use already constrains
 * the shape. The point is that a MOCK provider, a future provider, or a
 * relaxed tool_choice fallback can all return something off-shape, and a
 * malformed artifact must fail loudly at the boundary rather than land in a
 * client report.
 */

export function validate(value, schema, path = '$') {
  const errors = [];
  check(value, schema, path, errors);
  return { valid: errors.length === 0, errors };
}

function check(value, schema, path, errors) {
  if (!schema || typeof schema !== 'object') return;

  if (Array.isArray(schema.enum)) {
    if (!schema.enum.includes(value)) {
      errors.push(`${path}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`);
    }
    return;
  }

  const t = schema.type;
  if (value === null || value === undefined) {
    if (t) errors.push(`${path}: expected ${t}, got ${value === null ? 'null' : 'undefined'}`);
    return;
  }

  switch (t) {
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${path}: expected object, got ${describe(value)}`);
        return;
      }
      const props = schema.properties || {};
      for (const key of schema.required || []) {
        if (!(key in value)) errors.push(`${path}.${key}: required property missing`);
      }
      if (schema.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!(key in props)) errors.push(`${path}.${key}: unexpected property`);
        }
      }
      for (const [key, sub] of Object.entries(props)) {
        if (key in value) check(value[key], sub, `${path}.${key}`, errors);
      }
      return;
    }
    case 'array': {
      if (!Array.isArray(value)) {
        errors.push(`${path}: expected array, got ${describe(value)}`);
        return;
      }
      if (schema.minItems != null && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} items, got ${value.length}`);
      if (schema.maxItems != null && value.length > schema.maxItems) errors.push(`${path}: allows at most ${schema.maxItems} items, got ${value.length}`);
      if (schema.items) value.forEach((v, i) => check(v, schema.items, `${path}[${i}]`, errors));
      return;
    }
    case 'string': {
      if (typeof value !== 'string') { errors.push(`${path}: expected string, got ${describe(value)}`); return; }
      if (schema.minLength != null && value.length < schema.minLength) errors.push(`${path}: shorter than minLength ${schema.minLength}`);
      if (schema.maxLength != null && value.length > schema.maxLength) errors.push(`${path}: longer than maxLength ${schema.maxLength}`);
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: does not match ${schema.pattern}`);
      return;
    }
    case 'integer':
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) { errors.push(`${path}: expected ${t}, got ${describe(value)}`); return; }
      if (t === 'integer' && !Number.isInteger(value)) errors.push(`${path}: expected integer, got ${value}`);
      if (schema.minimum != null && value < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
      if (schema.maximum != null && value > schema.maximum) errors.push(`${path}: above maximum ${schema.maximum}`);
      return;
    }
    case 'boolean': {
      if (typeof value !== 'boolean') errors.push(`${path}: expected boolean, got ${describe(value)}`);
      return;
    }
    default:
      return;
  }
}

function describe(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}
