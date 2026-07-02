/**
 * Auto-formats raw digit input into Pakistani CNIC format as the user
 * types: xxxxx-xxxxxxx-x. Strips anything that isn't a digit first, so it
 * is safe to call on every keystroke (including pasted values).
 */
export function formatCnicInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 12);
  const part3 = digits.slice(12, 13);

  let result = part1;
  if (part2) result += `-${part2}`;
  if (part3) result += `-${part3}`;
  return result;
}

export const CNIC_PATTERN = /^\d{5}-\d{7}-\d{1}$/;
