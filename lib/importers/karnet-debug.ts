/** Set `KARNET_PARSER_DEBUG=0` to silence parser logs. Enabled by default. */
export const karnetParserDebugEnabled =
  process.env.KARNET_PARSER_DEBUG !== "0";

/** Structured parser diagnostics for import troubleshooting. */
export function logKarnetParse(
  step: string,
  payload: Record<string, unknown>,
): void {
  if (!karnetParserDebugEnabled) return;
  console.info(`[karnet:parser] ${step}`, payload);
}
