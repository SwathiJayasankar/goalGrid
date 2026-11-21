function repairJson(str) {
  if (!str || typeof str !== 'string') return null;

  // 1. Strip markdown code fences (e.g. ```json ... ```)
  let clean = str.replace(/^\s*```(?:json)?/im, '').replace(/```\s*$/m, '').trim();
  const start = clean.indexOf('{');
  if (start === -1) return null;
  clean = clean.substring(start);

  // Quick try: direct parse
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') return normalizePlan(parsed);
  } catch (e) {}

  // 2. Remove trailing commas before } or ]
  clean = clean.replace(/,\s*([}\]])/g, '$1');
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') return normalizePlan(parsed);
  } catch (e) {}

  // 3. Clean up unescaped control chars in strings
  clean = clean.replace(/[\u0000-\u001F]+/g, (match) => {
    if (match === '\n' || match === '\r' || match === '\t') return match;
    return ' ';
  });

  // 4. Try scanning to balance unclosed strings and structures
  let inString = false;
  let escape = false;
  const stack = [];
  let buffer = '';

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (escape) {
      escape = false;
      buffer += ch;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      buffer += ch;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      buffer += ch;
      continue;
    }
    if (inString) {
      buffer += ch;
      continue;
    }
    if (ch === '{' || ch === '[') {
      stack.push(ch === '{' ? '}' : ']');
      buffer += ch;
    } else if (ch === '}' || ch === ']') {
      if (stack.length && stack[stack.length - 1] === ch) {
        stack.pop();
      }
      buffer += ch;
    } else {
      buffer += ch;
    }
  }

  // If truncated inside a string, close the string quote
  if (inString) {
    buffer += '"';
  }

  // Remove any trailing comma before closing
  buffer = buffer.replace(/,\s*$/, '');
  buffer = buffer.replace(/,\s*"[^"]*"\s*:\s*$/, '');
  buffer = buffer.replace(/{\s*"[^"]*"\s*:\s*$/, '{');

  // Close remaining open brackets/braces in reverse order
  let closed = buffer;
  const closingChars = [...stack].reverse();
  for (const c of closingChars) {
    closed = closed.replace(/,\s*$/, '') + c;
  }

  try {
    const parsed = JSON.parse(closed);
    if (parsed && typeof parsed === 'object') return normalizePlan(parsed);
  } catch (e) {
    // Second-pass recovery: cut back to the last valid comma separator and close
    let lastValidComma = buffer.lastIndexOf(',');
    if (lastValidComma > 0) {
      let cutBuffer = buffer.substring(0, lastValidComma).trim();
      let s2 = [];
      let inS2 = false;
      let esc2 = false;
      for (let i = 0; i < cutBuffer.length; i++) {
        let ch = cutBuffer[i];
        if (esc2) { esc2 = false; continue; }
        if (ch === '\\') { esc2 = true; continue; }
        if (ch === '"') { inS2 = !inS2; continue; }
        if (inS2) continue;
        if (ch === '{' || ch === '[') s2.push(ch === '{' ? '}' : ']');
        else if (ch === '}' || ch === ']') {
          if (s2.length && s2[s2.length - 1] === ch) s2.pop();
        }
      }
      if (inS2) cutBuffer += '"';
      while (s2.length > 0) {
        cutBuffer = cutBuffer.replace(/,\s*$/, '') + s2.pop();
      }
      try {
        const parsed = JSON.parse(cutBuffer);
        if (parsed && typeof parsed === 'object') return normalizePlan(parsed);
      } catch (err2) {}
    }
  }

  return null;
}

function normalizePlan(plan) {
  if (!plan || typeof plan !== 'object') return null;
  return {
    title: plan.title || 'Goal Strategy',
    overview: plan.overview || '',
    timeline: plan.timeline || '',
    roadmap: Array.isArray(plan.roadmap) ? plan.roadmap : [],
    weeklySchedule: Array.isArray(plan.weeklySchedule) ? plan.weeklySchedule : [],
    dailyCheckpoints: Array.isArray(plan.dailyCheckpoints) ? plan.dailyCheckpoints : [],
    keyMetrics: Array.isArray(plan.keyMetrics) ? plan.keyMetrics : [],
    tips: Array.isArray(plan.tips) ? plan.tips : []
  };
}

module.exports = { repairJson, normalizePlan };

