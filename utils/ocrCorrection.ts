import stringSimilarity from 'string-similarity';

export interface InventoryName {
  id?: string;
  name: string;
}

// Threshold-based fuzzy matching with input validation
export function correctName(input: string, inventoryNames: InventoryName[]): string {
  if (typeof input !== 'string' || !Array.isArray(inventoryNames)) {
    console.warn('❌ Invalid input or inventoryNames:', { input, inventoryNames });
    return input;
  }

  const inputLower = input.toLowerCase();
  const candidateNames = inventoryNames
    .map((item) => item?.name?.toLowerCase?.())
    .filter((name): name is string => typeof name === 'string');

  if (candidateNames.length === 0) {
    console.warn('❌ No valid candidate names found');
    return input;
  }

  const { bestMatch } = stringSimilarity.findBestMatch(inputLower, candidateNames);

  console.log(`🔍 Matching "${input}" → "${bestMatch.target}" (score: ${bestMatch.rating})`);

  if (bestMatch.rating > 0.75) {
    return bestMatch.target;
  }

  return input;
}

// ✅ Improved OCR line parser — handles leading digits (e.g., "4 Tomato 2.0 kg")
export function normalizeLine(line: string): { name: string; quantity: number; unit: string } | null {
  const cleaned = line
    .replace(/0(?=\w)/g, 'o')              // fix "0nion" → "onion"
    .replace(/(?<=\w)0/g, 'o')             // fix "tomat0" → "tomato"
    .replace(/[=:_•■●◆★・▶️→~#※\\-]/g, '') // remove common OCR artifacts
    .replace(/[^\w\d.,\s]/g, '')           // remove invalid characters, keep space
    .replace(/\s+/g, ' ')                  // collapse multiple spaces
    .trim();

  console.log(`✅ Cleaned line: "${line}" → "${cleaned}"`);

  // Pattern 1: Tomato 2.0 kg
  let match = cleaned.match(/^([A-Za-z\s]+?)\s+([\d.,]+)\s*(kg|g|ml)?$/i);

  // Pattern 2: 4 Tomato 2.0 kg
  if (!match) {
    match = cleaned.match(/^\d+\s+([A-Za-z\s]+?)\s+([\d.,]+)\s*(kg|g|ml)?$/i);
  }

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
