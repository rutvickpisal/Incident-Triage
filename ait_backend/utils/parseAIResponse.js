export function parseAIResponse(text) {
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON found");
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    // Basic validation
    if (
      !parsed.severity ||
      !Array.isArray(parsed.possibleCauses) ||
      !Array.isArray(parsed.nextSteps) ||
      typeof parsed.confidence !== "number"
    ) {
      throw new Error("Invalid AI response shape");
    }

    return parsed;
  } catch (err) {
    return null;
  }
}
