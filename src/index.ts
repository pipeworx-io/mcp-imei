interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * IMEI validation MCP.
 *
 * Keyless, offline: validate a 15-digit IMEI (Luhn check digit) or a 16-digit
 * IMEISV, and break out its parts — TAC (Type Allocation Code), serial number
 * and check digit. Pure algorithm — no API, no key. It validates the NUMBER; it
 * does not look up the device model or blacklist status.
 */


function luhn(digits: string): boolean {
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) { let n = digits.charCodeAt(i) - 48; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
  return sum % 10 === 0;
}
function luhnCheckDigit(body: string): number {
  let sum = 0, alt = true;
  for (let i = body.length - 1; i >= 0; i--) { let n = body.charCodeAt(i) - 48; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
  return (10 - (sum % 10)) % 10;
}

const tools: McpToolExport['tools'] = [
  {
    name: 'validate_imei',
    description: 'Validate an IMEI (15 digits, with Luhn check) or IMEISV (16 digits, no check). Keyless/offline. Returns validity and the parts: TAC (Type Allocation Code, first 8), serial number, and check digit. Spaces/dashes ignored. Validates the number, not the device.',
    inputSchema: { type: 'object', properties: { imei: { type: 'string', description: 'A 15-digit IMEI or 16-digit IMEISV, e.g. "490154203237518".' } }, required: ['imei'] },
  },
  {
    name: 'imei_check_digit',
    description: 'Compute the Luhn check digit for the first 14 digits of an IMEI (use to complete or repair an IMEI).',
    inputSchema: { type: 'object', properties: { digits: { type: 'string', description: 'The first 14 digits (no check digit).' } }, required: ['digits'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'validate_imei': {
      const imei = reqStr(args, 'imei', '"490154203237518"').replace(/[\s-]/g, '');
      if (!/^\d{15,16}$/.test(imei)) return { input: imei, valid: false, reason: 'Expected 15 digits (IMEI) or 16 digits (IMEISV).' };
      if (imei.length === 16) {
        return { input: imei, valid: true, type: 'IMEISV', tac: imei.slice(0, 8), serial_number: imei.slice(8, 14), software_version: imei.slice(14, 16), note: 'IMEISV has no Luhn check digit.' };
      }
      const ok = luhn(imei);
      return { input: imei, valid: ok, type: 'IMEI', tac: imei.slice(0, 8), serial_number: imei.slice(8, 14), check_digit: +imei[14], expected_check_digit: luhnCheckDigit(imei.slice(0, 14)), reason: ok ? 'Valid IMEI Luhn check digit.' : `Check digit ${imei[14]} is wrong; expected ${luhnCheckDigit(imei.slice(0, 14))}.` };
    }
    case 'imei_check_digit': {
      const d = reqStr(args, 'digits', '"49015420323751"').replace(/[\s-]/g, '');
      if (!/^\d{14}$/.test(d)) return { input: d, reason: 'Expected exactly 14 digits.' };
      return { digits: d, check_digit: luhnCheckDigit(d), full_imei: d + luhnCheckDigit(d) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
