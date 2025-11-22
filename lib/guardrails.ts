const BLOCKED_PATTERNS = [
  /\b(kill|murder|suicide|self[\s-]?harm)\b/i,
  /\b(sexual|explicit|porn|xxx)\b/i,
  /\b(child|minor|underage).{0,20}(sex|abuse|exploit)/i,
  /\b(threat|violence|attack|bomb|weapon).{0,20}(kill|harm|destroy)/i,
];

export function checkGuardrails(text: string): boolean {
  const combinedText = text.toLowerCase();
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(combinedText)) {
      return true;
    }
  }
  
  return false;
}
