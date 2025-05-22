import stringSimilarity from 'string-similarity';

export interface InventoryName {
  id?: string;
  name: string;
}

// Threshold-based fuzzy matching
export function correctName(input: string, inventoryNames: InventoryName[]): string {
  const inputLower = input.toLowerCase();
  const candidateNames = inventoryNames.map((item) => item.name.toLowerCase());

  const { bestMatch } = stringSimilarity.findBestMatch(inputLower, candidateNames);

  console.log(`🔍 Matching "${input}" → "${bestMatch.target}" (score: ${bestMatch.rating})`);

  // Only return match if it's similar enough
  if (bestMatch.rating > 0.75) {
    return bestMatch.target;
  }

  return input; // return original if no good match
}

// ✅ Improved OCR line parser — allows symbols like '=', ':', '•', etc.
export function normalizeLine(line: string): { name: string; quantity: number; unit: string } | null {
  const cleaned = line
    .replace(/0(?=\w)/g, 'o')              // fix "0nion" → "onion"
    .replace(/(?<=\w)0/g, 'o')             // fix "tomat0" → "tomato"
    .replace(/[=:_•■●◆★・▶️→~#※\\-]/g, '') // remove common OCR artifacts
    .replace(/[^\w\d.,\s]/g, '')           // remove invalid characters, keep space
    .replace(/\s+/g, ' ')                  // collapse multiple spaces
    .trim();

  console.log(`✅ Cleaned line: "${line}" → "${cleaned}"`);

  const match = cleaned.match(/^([A-Za-z\s]+?)\s+([\d.,]+)\s*(kg|g|ml)?$/i);
  if (!match) {
    console.warn(`⚠️ Failed to match cleaned line: "${cleaned}"`);
    return null;
  }

  const name = match[1].trim();
  const quantity = parseFloat(match[2].replace(',', '.'));
  const unit = match[3]?.toLowerCase() || 'kg';

  if (!name || isNaN(quantity)) return null;

  return { name, quantity, unit };
}
