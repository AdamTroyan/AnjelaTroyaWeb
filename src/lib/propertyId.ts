const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "0123456789";
const LETTER_POSITIONS = [4, 6, 11, 13];
const TOTAL_LENGTH = 14;

function randomChar(chars: string) {
  const index = Math.floor(Math.random() * chars.length);
  return chars[index] ?? "";
}

export function generatePropertyId() {
  const letters = new Set<string>();
  while (letters.size < LETTER_POSITIONS.length) {
    letters.add(randomChar(LETTERS));
  }
  const lettersArray = Array.from(letters);

  const chars: string[] = Array.from({ length: TOTAL_LENGTH }, () => "");
  LETTER_POSITIONS.forEach((pos, index) => {
    chars[pos] = lettersArray[index] ?? randomChar(LETTERS);
  });

  for (let i = 0; i < TOTAL_LENGTH; i += 1) {
    if (!chars[i]) {
      chars[i] = randomChar(DIGITS);
    }
  }

  return chars.join("");
}
